namespace Krea.API {
    using System.Security.Cryptography;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.AspNetCore.HttpOverrides;
    using Microsoft.IdentityModel.Tokens;
    using Scalar.AspNetCore;
    using System.Text;
    using Infrastructure;
    using Application;
    using Application.Abstractions.Auth;
    using Application.Abstractions.Payments;
    using Application.Abstractions.Url;
    using Hubs;
    using Infrastructure.Services;
    using Infrastructure.Setup;
    using Microsoft.Extensions.Primitives;
    using Services;
    using Services.Krea.API.Services;

    internal static class Program {
        private const string CorsPolicyName = "AllowFrontend";
        private const string InsecureDevelopmentJwtKey =
            "LaRevolucionIndustrialYSusConsecuenciasHanSidoUnDesastreParaLaRazaHumana";
        private static readonly string[] DevelopmentCorsOrigins =
            ["http://localhost:5173", "http://127.0.0.1:5173"];

        public static async Task Main(string[] args) {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            ApplyApiConfigurationOverrides(builder.Configuration, builder.Environment.IsDevelopment());
            builder.AddInfrastructure();

            builder.Services.AddApplication();
            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            if (builder.Environment.IsDevelopment()) {
                builder.Services.AddOpenApi();
            }

            ConfigureCors(builder.Services, builder.Configuration, builder.Environment.IsDevelopment());
            ConfigureAuthentication(builder.Services, builder.Configuration, builder.Environment.IsDevelopment());
            builder.Services.AddAuthorization();
            
            // Stripe
            builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection("Stripe"));
            builder.Services.AddScoped<IPaymentGateway, StripePaymentGateway>();
        
            // API Services
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddHttpClient();
            builder.Services.AddScoped<IConfirmationUrlBuilder, ConfirmationUrlBuilder>();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

            WebApplication app = builder.Build();
            bool enforceHttpsRedirection =
                app.Configuration.GetValue<bool>("Security:EnforceHttpsRedirection");

            var forwardedHeadersOptions = new ForwardedHeadersOptions {
                ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
            };
            forwardedHeadersOptions.KnownNetworks.Clear();
            forwardedHeadersOptions.KnownProxies.Clear();
            app.UseForwardedHeaders(forwardedHeadersOptions);

            if (!app.Environment.IsDevelopment() && enforceHttpsRedirection) {
                app.UseHsts();
            }

            using (IServiceScope scope = app.Services.CreateScope()) {
                await DatabaseInitializer.InitializeAsync(scope.ServiceProvider);
            }

            if (app.Environment.IsDevelopment()) {
                app.MapOpenApi();
                app.MapScalarApiReference(options => {
                    options
                        .WithTitle("Krea API")
                        .WithTheme(ScalarTheme.Purple)
                        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
                    options.AddPreferredSecuritySchemes("Bearer");
                });
            }

            if (enforceHttpsRedirection) {
                app.UseHttpsRedirection();
            }
            app.UseCors(CorsPolicyName);
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseStaticFiles();
            app.MapControllers();
            app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

            app.MapHub<DirectMessageHub>("/hubs/directmessage");
            MapUploadsProxy(app);
            MapSpaFallback(app);

            await app.RunAsync();
        }

        private static void ApplyApiConfigurationOverrides(
            ConfigurationManager configuration,
            bool isDevelopment) {
            string jwtIssuer =
                configuration["Jwt:Issuer"]
                ?? "KreaAPI";

            string jwtAudience =
                configuration["Jwt:Audience"]
                ?? "KreaClient";

            string? configuredJwtKey = configuration["Jwt:Key"];
            bool jwtKeyIsInvalid = string.IsNullOrWhiteSpace(configuredJwtKey)
                                 || (!isDevelopment && configuredJwtKey.Equals(InsecureDevelopmentJwtKey, StringComparison.Ordinal));
            
            string jwtSigningKey;
            if (jwtKeyIsInvalid) {
                // If it's missing or insecure, check if we've already generated one in this process group/env
                string? envGeneratedKey = Environment.GetEnvironmentVariable("KREA_GENERATED_JWT_KEY");
                if (!string.IsNullOrWhiteSpace(envGeneratedKey)) {
                    jwtSigningKey = envGeneratedKey;
                } else {
                    jwtSigningKey = GenerateJwtSigningKey();
                    // Optional: we could persist it to .env if we were allowed, but at least consistent for current process
                }
            } else {
                jwtSigningKey = configuredJwtKey!;
            }

            string publicUrl =
                ReadFirstNonEmptyEnvironmentVariable("PUBLIC_URL")
                ?? configuration["PublicUrl"]
                ?? (isDevelopment ? "http://localhost:5173" : "http://localhost:3000");

            string enforceHttpsRedirection = ResolveBooleanConfiguration(
                ReadFirstNonEmptyEnvironmentVariable("ENFORCE_HTTPS_REDIRECTION"),
                configuration.GetValue<bool?>("Security:EnforceHttpsRedirection") ?? false);

            string seedingEnabled = ResolveBooleanConfiguration(
                ReadFirstNonEmptyEnvironmentVariable("SEEDING_ENABLED"),
                configuration.GetValue<bool?>("Seeding:Enabled") ?? false);

            var overrides = new Dictionary<string, string?> {
                ["Jwt:Issuer"] = jwtIssuer,
                ["Jwt:Audience"] = jwtAudience,
                ["Jwt:Key"] = jwtSigningKey,
                ["PublicUrl"] = publicUrl,
                ["Security:EnforceHttpsRedirection"] = enforceHttpsRedirection,
                ["Seeding:Enabled"] = seedingEnabled,
                ["AdminUser:Email"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_EMAIL")
                    ?? configuration["AdminUser:Email"]
                    ?? "admin@krea.local",
                ["AdminUser:Username"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_USERNAME")
                    ?? configuration["AdminUser:Username"]
                    ?? "admin",
                ["AdminUser:Password"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_PASSWORD")
                    ?? configuration["AdminUser:Password"],
                ["AdminUser:DisplayName"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_DISPLAY_NAME")
                    ?? configuration["AdminUser:DisplayName"]
                    ?? "Administrator",
                ["InstanceSettings:PlatformName"] =
                    ReadFirstNonEmptyEnvironmentVariable("INSTANCE_PLATFORM_NAME")
                    ?? configuration["InstanceSettings:PlatformName"]
                    ?? "Krea",
                ["InstanceSettings:Description"] =
                    ReadFirstNonEmptyEnvironmentVariable("INSTANCE_DESCRIPTION")
                    ?? configuration["InstanceSettings:Description"]
                    ?? "A federated platform for artists and creators",
                ["InstanceSettings:AdministratorEmail"] =
                    ReadFirstNonEmptyEnvironmentVariable("INSTANCE_ADMIN_EMAIL")
                    ?? configuration["InstanceSettings:AdministratorEmail"]
                    ?? "admin@krea.local",
                ["Stripe:ApiKey"] =
                    ReadFirstNonEmptyEnvironmentVariable("STRIPE_API_KEY")
                    ?? configuration["Stripe:ApiKey"],
                ["Stripe:WebhookSecret"] =
                    ReadFirstNonEmptyEnvironmentVariable("STRIPE_WEBHOOK_SECRET")
                    ?? configuration["Stripe:WebhookSecret"]
            };

            var normalizedOverrides = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
            foreach ((string key, string? value) in overrides) {
                if (string.IsNullOrWhiteSpace(value)) {
                    continue;
                }

                normalizedOverrides[key] = value;
            }

            configuration.AddInMemoryCollection(normalizedOverrides);
        }

        private static void MapSpaFallback(WebApplication app) {
            app.MapFallback(async context => {
                PathString requestPath = context.Request.Path;

                if (requestPath.StartsWithSegments("/api") ||
                    requestPath.StartsWithSegments("/hubs") ||
                    requestPath.StartsWithSegments("/health") ||
                    requestPath.StartsWithSegments("/uploads") ||
                    Path.HasExtension(requestPath.Value))
                {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    return;
                }

                string webRootPath =
                    app.Environment.WebRootPath
                    ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");

                string indexFilePath = Path.Combine(webRootPath, "index.html");
                if (!File.Exists(indexFilePath)) {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    return;
                }

                context.Response.ContentType = "text/html; charset=utf-8";
                await context.Response.SendFileAsync(indexFilePath);
            });
        }

        private static void MapUploadsProxy(WebApplication app) {
            app.MapMethods("/uploads/{**objectPath}", ["GET", "HEAD"], async context => {
                string? objectPath = context.Request.RouteValues["objectPath"]?.ToString();
                if (string.IsNullOrWhiteSpace(objectPath)) {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    return;
                }

                string endpoint = GetRequiredConfiguration(app.Configuration, "Minio:Endpoint");
                string bucket = app.Configuration["Minio:Bucket"] ?? "uploads";
                bool useSsl = app.Configuration.GetValue<bool>("Minio:UseSsl");

                string scheme = useSsl ? "https" : "http";
                string sanitizedObjectPath = objectPath.TrimStart('/');
                string targetUrl = $"{scheme}://{endpoint}/{bucket}/{sanitizedObjectPath}";

                var clientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
                HttpClient client = clientFactory.CreateClient();

                using var upstreamRequest = new HttpRequestMessage(
                    new HttpMethod(context.Request.Method),
                    targetUrl);

                CopyProxyRequestHeaders(context.Request, upstreamRequest);

                using HttpResponseMessage upstreamResponse = await client.SendAsync(
                    upstreamRequest,
                    HttpCompletionOption.ResponseHeadersRead,
                    context.RequestAborted);

                context.Response.StatusCode = (int)upstreamResponse.StatusCode;
                CopyProxyResponseHeaders(upstreamResponse, context.Response);

                if (HttpMethods.IsHead(context.Request.Method)) {
                    return;
                }

                await using Stream upstreamStream = await upstreamResponse.Content.ReadAsStreamAsync(context.RequestAborted);
                await upstreamStream.CopyToAsync(context.Response.Body, context.RequestAborted);
            });
        }

        private static void CopyProxyRequestHeaders(HttpRequest source, HttpRequestMessage target) {
            foreach ((string key, StringValues value) in source.Headers) {
                if (string.Equals(key, "Host", StringComparison.OrdinalIgnoreCase)) {
                    continue;
                }

                if (!target.Headers.TryAddWithoutValidation(key, value.ToArray())) {
                    target.Content ??= new ByteArrayContent([]);
                    target.Content.Headers.TryAddWithoutValidation(key, value.ToArray());
                }
            }
        }

        private static void CopyProxyResponseHeaders(HttpResponseMessage source, HttpResponse target) {
            foreach ((string key, IEnumerable<string> value) in source.Headers) {
                if (ShouldSkipProxyResponseHeader(key)) {
                    continue;
                }

                target.Headers[key] = new StringValues(value.ToArray());
            }

            foreach ((string key, IEnumerable<string> value) in source.Content.Headers) {
                if (ShouldSkipProxyResponseHeader(key)) {
                    continue;
                }

                target.Headers[key] = new StringValues(value.ToArray());
            }

            target.Headers.Remove("transfer-encoding");
        }

        private static bool ShouldSkipProxyResponseHeader(string headerName) {
            return string.Equals(headerName, "Connection", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "Keep-Alive", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "Proxy-Authenticate", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "Proxy-Authorization", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "TE", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "Trailer", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "Transfer-Encoding", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(headerName, "Upgrade", StringComparison.OrdinalIgnoreCase);
        }

        private static void ConfigureCors(
            IServiceCollection services,
            IConfiguration configuration,
            bool isDevelopment) {
            string[] allowedOrigins = ResolveAllowedOrigins(configuration, isDevelopment);

            services.AddCors(options => {
                options.AddPolicy(CorsPolicyName, policy => {
                    if (allowedOrigins.Length == 0) {
                        policy.SetIsOriginAllowed(_ => false)
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                        return;
                    }

                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });
        }

        private static string[] ResolveAllowedOrigins(IConfiguration configuration, bool isDevelopment) {
            string? publicUrl = configuration["PublicUrl"];
            List<string> configuredOrigins = new();

            if (!string.IsNullOrWhiteSpace(publicUrl)) {
                // If the user forgot the protocol, try to be helpful
                if (!publicUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) && 
                    !publicUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase)) {
                    
                    if (Uri.TryCreate($"https://{publicUrl}", UriKind.Absolute, out Uri? httpsUri)) {
                        configuredOrigins.Add(httpsUri.GetLeftPart(UriPartial.Authority));
                        configuredOrigins.Add($"http://{httpsUri.Authority}");
                    } else if (Uri.TryCreate($"http://{publicUrl}", UriKind.Absolute, out Uri? httpUri)) {
                        configuredOrigins.Add(httpUri.GetLeftPart(UriPartial.Authority));
                        configuredOrigins.Add($"https://{httpUri.Authority}");
                    }
                }
                else if (Uri.TryCreate(publicUrl, UriKind.Absolute, out Uri? uri)) {
                    configuredOrigins.Add(uri.GetLeftPart(UriPartial.Authority));
                    
                    if (uri.Scheme == Uri.UriSchemeHttps) {
                        configuredOrigins.Add($"http://{uri.Authority}");
                    } else if (uri.Scheme == Uri.UriSchemeHttp) {
                        configuredOrigins.Add($"https://{uri.Authority}");
                    }
                }
            }

            if (configuredOrigins.Count > 0) {
                return configuredOrigins.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
            }

            return isDevelopment ? DevelopmentCorsOrigins : Array.Empty<string>();
        }

        private static void ConfigureAuthentication(
            IServiceCollection services,
            IConfiguration configuration,
            bool isDevelopment) {
            string issuer = GetRequiredConfiguration(configuration, "Jwt:Issuer");
            string audience = GetRequiredConfiguration(configuration, "Jwt:Audience");
            string signingKey = GetRequiredConfiguration(configuration, "Jwt:Key");

            if (signingKey.Length < 32) {
                throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");
            }

            if (!isDevelopment && signingKey.Equals(InsecureDevelopmentJwtKey, StringComparison.Ordinal)) {
                throw new InvalidOperationException(
                    "A secure Jwt:Key must be configured for non-development environments.");
            }

            services.AddAuthentication(options => {
                        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    })
                    .AddJwtBearer(options => {
                        options.RequireHttpsMetadata = !isDevelopment;
                        options.TokenValidationParameters = new TokenValidationParameters {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = issuer,
                            ValidAudience = audience,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey))
                        };

                        // Accept token in query string for SignalR hub connections.
                        options.Events = new JwtBearerEvents {
                            OnMessageReceived = context => {
                                StringValues accessToken = context.Request.Query["access_token"];
                                PathString path = context.HttpContext.Request.Path;

                                if (!string.IsNullOrEmpty(accessToken) &&
                                    (
                                        path.StartsWithSegments("/hubs") ||
                                        path.StartsWithSegments("/api/notifications/stream")
                                    ))
                                {
                                    context.Token = accessToken;
                                }

                                return Task.CompletedTask;
                            }
                        };
                    });
        }

        private static string GetRequiredConfiguration(IConfiguration configuration, string key) {
            string? value = configuration[key];
            if (string.IsNullOrWhiteSpace(value)) {
                throw new InvalidOperationException($"Missing required configuration value: {key}");
            }

            return value;
        }

        private static string? ReadFirstNonEmptyEnvironmentVariable(params string[] variableNames) {
            foreach (string variableName in variableNames) {
                string? value = Environment.GetEnvironmentVariable(variableName);
                if (!string.IsNullOrWhiteSpace(value)) {
                    return value;
                }
            }

            return null;
        }

        private static string ResolveBooleanConfiguration(string? rawValue, bool fallback) {
            if (string.IsNullOrWhiteSpace(rawValue)) {
                return fallback ? "true" : "false";
            }

            if (rawValue == "1") {
                return "true";
            }

            if (rawValue == "0") {
                return "false";
            }

            return bool.TryParse(rawValue, out bool parsed)
                ? (parsed ? "true" : "false")
                : (fallback ? "true" : "false");
        }

        private static string GenerateJwtSigningKey() {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }
    }
}
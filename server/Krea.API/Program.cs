namespace Krea.API {
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.AspNetCore.HttpOverrides;
    using Microsoft.IdentityModel.Tokens;
    using Scalar.AspNetCore;
    using System.Text;
    using Infrastructure;
    using Application;
    using Application.Abstractions.Url;
    using Hubs;
    using Infrastructure.Configuration;
    using Infrastructure.Setup;
    using Microsoft.Extensions.Primitives;
    using Services;

    internal static class Program {
        private const string CorsPolicyName = "AllowFrontend";
        private const string InsecureDevelopmentJwtKey =
            "LaRevolucionIndustrialYSusConsecuenciasHanSidoUnDesastreParaLaRazaHumana";
        private static readonly string[] DevelopmentCorsOrigins =
            ["http://localhost:5173", "http://127.0.0.1:5173"];

        public static async Task Main(string[] args) {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args).AddInfrastructure();

            builder.Services.AddApplication();
            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            if (builder.Environment.IsDevelopment()) {
                builder.Services.AddOpenApi();
            }

            ConfigureCors(builder.Services, builder.Configuration, builder.Environment.IsDevelopment());
            ConfigureAuthentication(builder.Services, builder.Configuration, builder.Environment.IsDevelopment());

            builder.Services.AddAuthorization();

            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<IConfirmationUrlBuilder, ConfirmationUrlBuilder>();

            // Seeding config
            builder.Services.Configure<AdminUserOptions>(builder.Configuration.GetSection("AdminUser"));
            builder.Services.Configure<SeedingOptions>(builder.Configuration.GetSection("Seeding"));

            WebApplication app = builder.Build();
            bool enforceHttpsRedirection =
                app.Configuration.GetValue<bool>("Security:EnforceHttpsRedirection");

            app.UseForwardedHeaders(new ForwardedHeadersOptions {
                ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
            });

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

            await app.RunAsync();
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
            string[] fromSection = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
            string[] fromCsv = (configuration["Cors:AllowedOriginsCsv"] ?? string.Empty)
                               .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

            string[] configuredOrigins = fromSection.Concat(fromCsv)
                                                    .Where(origin => Uri.IsWellFormedUriString(origin, UriKind.Absolute))
                                                    .Distinct(StringComparer.OrdinalIgnoreCase)
                                                    .ToArray();

            if (configuredOrigins.Length > 0) {
                return configuredOrigins;
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

                                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs")) {
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
    }
}
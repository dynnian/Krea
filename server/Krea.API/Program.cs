namespace Krea.API {
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.IdentityModel.Tokens;
    using Scalar.AspNetCore;
    using System.Text;
    using Infrastructure;
    using Application;
    using Application.Abstractions.Auth;
    using Application.Abstractions.Payments;
    using Application.Abstractions.Url;
    using Hubs;
    using Infrastructure.Configuration;
    using Infrastructure.Services;
    using Infrastructure.Setup;
    using Services;

    internal static class Program {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
        
            builder.Services.AddApplication();
            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            builder.Services.AddOpenApi();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });
        

            // Agregar infraestructura (DbContext, Identity, repositorios, servicios)
            builder.Services.AddInfrastructure(builder.Configuration);

            // Configurar autenticación JWT
            builder.Services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                    };
                    // Accept token in query string
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
            
            // Stripe
            builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection("Stripe"));
            builder.Services.AddScoped<IPaymentGateway, StripePaymentGateway>();

            builder.Services.AddAuthorization();
        
            // API Services
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<IConfirmationUrlBuilder, ConfirmationUrlBuilder>();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
            
            // Seeding configs
            builder.Services.Configure<AdminUserOptions>(builder.Configuration.GetSection("AdminUser"));
            builder.Services.Configure<SeedingOptions>(builder.Configuration.GetSection("Seeding"));

            WebApplication app = builder.Build();

            using (IServiceScope scope = app.Services.CreateScope())
            {
                await DatabaseInitializer.InitializeAsync(scope.ServiceProvider);
            }
            
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference(options => {
                    options
                        .WithTitle("Krea API")
                        .WithTheme(ScalarTheme.Purple)
                        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
                });
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseStaticFiles();
            app.UseCors("AllowFrontend");
            app.MapControllers();
            
            app.MapHub<DirectMessageHub>("/hubs/directmessage");

            await app.RunAsync();
        }
    }
}

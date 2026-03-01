namespace Krea.API {
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;
    using Microsoft.AspNetCore.Identity;
    using Scalar.AspNetCore;
    using Application.Abstractions.Url;
    using Infrastructure;
    using Application;
    using Services;

    internal class Program {
        public static async Task Main(string[] args) {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            // Agregar infraestructura (DbContext, Identity, repositorios, servicios)
            builder.Services.AddInfrastructure(builder.Configuration);

            builder.Services.AddApplication();
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            // Configurar autenticación JWT
            builder.Services.AddAuthentication(options => {
                       options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                       options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                   })
                   .AddJwtBearer(options => {
                       options.TokenValidationParameters = new TokenValidationParameters {
                           ValidateIssuer = true,
                           ValidateAudience = true,
                           ValidateLifetime = true,
                           ValidateIssuerSigningKey = true,
                           ValidIssuer = builder.Configuration["Jwt:Issuer"],
                           ValidAudience = builder.Configuration["Jwt:Audience"],
                           IssuerSigningKey = new SymmetricSecurityKey(
                               Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                       };
                   });

            builder.Services.AddAuthorization();

            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<IConfirmationUrlBuilder, ConfirmationUrlBuilder>();

            WebApplication app = builder.Build();

            // Identity Roles
            using (IServiceScope scope = app.Services.CreateScope()) {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
                string[] roles = new[] { "Admin", "Artist" };

                foreach (string role in roles) {
                    if (!await roleManager.RoleExistsAsync(role)) {
                        await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                    }
                }
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment()) {
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

            app.MapControllers();

            await app.RunAsync();
        }
    }
}
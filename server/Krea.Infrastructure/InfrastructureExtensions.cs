namespace Krea.Infrastructure {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Hosting;
    using Setup;

    public static class InfrastructureExtensions {
        public static WebApplicationBuilder AddInfrastructure(this WebApplicationBuilder builder) {
            if (!builder.Environment.IsDevelopment()) {
                builder.Configuration.AddJsonFile("/data/appsettings.json", false, true);
            }

            builder.Host.UseDefaultServiceProvider(options => options.ValidateScopes = false);

            LoggingSetup.ConfigureNLog(builder);

            builder.Services.AddInfrastructure(builder.Configuration);

            return builder;
        }
    }
}
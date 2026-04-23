namespace Krea.Infrastructure.Setup {
    using Configuration;
    using Data;
    using Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;

    public static class DatabaseInitializer {
        public static async Task InitializeAsync(IServiceProvider services) {
            var context = services.GetRequiredService<AppDbContext>();
            await context.Database.MigrateAsync();

            SeedingOptions options = services.GetRequiredService<IOptions<SeedingOptions>>().Value;

            if (!options.Enabled)
                return;

            await IdentityInitializer.InitializeAsync(services);
            await AdminSeeder.SeedAsync(services);
        }
    }
}
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
            await NormalizeMediaPathsAsync(context);

            SeedingOptions options = services.GetRequiredService<IOptions<SeedingOptions>>().Value;

            if (!options.Enabled)
                return;

            await IdentityInitializer.InitializeAsync(services);
            await AdminSeeder.SeedAsync(services);
        }

        private static async Task NormalizeMediaPathsAsync(AppDbContext context) {
            await context.Database.ExecuteSqlRawAsync("""
                UPDATE media
                SET "Path" = substring("Path" from '(/uploads/.*)$')
                WHERE "Path" ~* '^https?://[^/]+/uploads/'
                """);
        }
    }
}
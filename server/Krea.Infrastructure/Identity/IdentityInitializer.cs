namespace Krea.Infrastructure.Identity {
    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.DependencyInjection;

    public static class IdentityInitializer {
        public static async Task InitializeAsync(IServiceProvider services) {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            string[] roles = ["Admin", "Artist"];

            foreach (string role in roles) {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }
    }
}
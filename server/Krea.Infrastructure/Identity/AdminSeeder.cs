namespace Krea.Infrastructure.Identity {
    using Configuration;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;

    public static class AdminSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var userManager = services.GetRequiredService<UserManager<AppUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var options = services.GetRequiredService<IOptions<AdminUserOptions>>().Value;

            if (string.IsNullOrWhiteSpace(options.Email) ||
                string.IsNullOrWhiteSpace(options.Password))
            {
                return;
            }

            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
            }

            AppUser? existing = await userManager.FindByEmailAsync(options.Email);
            if (existing != null)
                return;

            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = options.Email,
                UserName = options.Username,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, options.Password);

            if (!result.Succeeded)
                throw new Exception("Failed to create admin user.");

            await userManager.AddToRoleAsync(user, "Admin");
        }
    }
}
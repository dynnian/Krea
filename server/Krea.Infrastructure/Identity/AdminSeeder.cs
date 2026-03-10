namespace Krea.Infrastructure.Identity {
    using Configuration;
    using Domain.Abstractions;
    using Domain.Repositories;
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
            var userRepository = services.GetRequiredService<IUserRepository>();
            var unitOfWork = services.GetRequiredService<IUnitOfWork>();
            
            if (string.IsNullOrWhiteSpace(options.Email) ||
                string.IsNullOrWhiteSpace(options.Password))
            {
                return;
            }

            // Create admin role if not exists
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
            }

            // Verify if user exists in identity
            var existingIdentity = await userManager.FindByEmailAsync(options.Email);
            if (existingIdentity != null)
            {
                return;
            }
            
            var appUser = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = options.Email,
                UserName = options.Username,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(appUser, options.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new Exception($"Error creating admin user: {errors}");
            }

            await userManager.AddToRoleAsync(appUser, "Admin");

            // Create Domain User
            var domainUser = new Domain.Entities.User(
                displayName: options.DisplayName,
                languageCode: "es",
                timeZoneId: "1",
                biography: null
            );

            // Align identity and domain IDs
            typeof(Domain.Entities.User).GetProperty(nameof(Domain.Entities.User.Id))?.SetValue(domainUser, appUser.Id);

            domainUser.ConfirmEmail();
            
            await userRepository.AddAsync(domainUser);
            await unitOfWork.SaveChangesAsync();
        }
    }
}
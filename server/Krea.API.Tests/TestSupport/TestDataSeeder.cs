namespace Krea.API.Tests.TestSupport;

using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Krea.Infrastructure.Data;
using Krea.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class TestDataSeeder {
    public sealed record SeededUsers(Guid AdminId, Guid ArtistId, Guid OtherId);

    public static async Task SeedRolesOnlyAsync(IServiceProvider services) {
        RoleManager<IdentityRole<Guid>> roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        await EnsureRoleAsync(roleManager, "Admin");
        await EnsureRoleAsync(roleManager, "Artist");
    }

    public static async Task<SeededUsers> SeedBasicUsersAsync(IServiceProvider services) {
        await SeedRolesOnlyAsync(services);

        AppDbContext db = services.GetRequiredService<AppDbContext>();
        UserManager<AppUser> userManager = services.GetRequiredService<UserManager<AppUser>>();

        User adminDomain = new("Admin Tester", "en", "UTC", "Admin bio");
        User artistDomain = new("Artist Tester", "en", "UTC", "Artist bio");
        User otherDomain = new("Other Tester", "en", "UTC", "Other bio");

        adminDomain.ConfirmEmail();
        artistDomain.ConfirmEmail();
        otherDomain.ConfirmEmail();

        await CreateIdentityUserAsync(userManager, adminDomain.Id, "admin", "admin@test.local", "Admin123!", "Admin");
        await CreateIdentityUserAsync(userManager, artistDomain.Id, "artist", "artist@test.local", "Admin123!", "Artist");
        await CreateIdentityUserAsync(userManager, otherDomain.Id, "other", "other@test.local", "Admin123!", "Artist");

        await db.DomainUsers.AddRangeAsync(adminDomain, artistDomain, otherDomain);
        await db.SaveChangesAsync();

        return new SeededUsers(adminDomain.Id, artistDomain.Id, otherDomain.Id);
    }

    public static async Task<Guid> SeedPostAsync(IServiceProvider services, Guid authorId, string title = "Hello post") {
        AppDbContext db = services.GetRequiredService<AppDbContext>();

        var post = new Post(authorId, PostType.Plain, title, "Post content", false, true);
        await db.Posts.AddAsync(post);
        await db.SaveChangesAsync();

        return post.Id;
    }

    public static async Task SeedFollowAsync(IServiceProvider services, Guid sourceId, Guid targetId) {
        AppDbContext db = services.GetRequiredService<AppDbContext>();
        await db.Follows.AddAsync(new Follow(sourceId, targetId));
        await db.SaveChangesAsync();
    }

    public static async Task<Guid> SeedPostModerationReportAsync(
        IServiceProvider services,
        Guid postId,
        Guid reporterUserId,
        string reason = "Spam",
        string? details = "Reported from tests") {
        AppDbContext db = services.GetRequiredService<AppDbContext>();

        var report = new PostModerationReport(postId, reporterUserId, reason, details);
        await db.PostModerationReports.AddAsync(report);
        await db.SaveChangesAsync();

        return report.Id;
    }

    public static async Task<int> CountFollowsAsync(IServiceProvider services, Guid sourceId, Guid targetId) {
        AppDbContext db = services.GetRequiredService<AppDbContext>();
        return await db.Follows.CountAsync(f => f.SourceId == sourceId && f.TargetId == targetId);
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole<Guid>> roleManager, string roleName) {
        if (!await roleManager.RoleExistsAsync(roleName)) {
            IdentityResult result = await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            if (!result.Succeeded) {
                throw new InvalidOperationException($"Unable to create role '{roleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }
    }

    private static async Task CreateIdentityUserAsync(
        UserManager<AppUser> userManager,
        Guid userId,
        string userName,
        string email,
        string password,
        string role) {
        var appUser = new AppUser {
            Id = userId,
            UserName = userName,
            Email = email,
            EmailConfirmed = true
        };

        IdentityResult createResult = await userManager.CreateAsync(appUser, password);
        if (!createResult.Succeeded) {
            throw new InvalidOperationException($"Unable to create user '{userName}': {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
        }

        IdentityResult roleResult = await userManager.AddToRoleAsync(appUser, role);
        if (!roleResult.Succeeded) {
            throw new InvalidOperationException($"Unable to add role '{role}' to '{userName}': {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
        }
    }
}

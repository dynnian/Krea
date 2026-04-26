namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Text.Json;
    using TestSupport;
    using Domain.Entities;
    using Domain.ValueObjects;
    using Infrastructure.Data;
    using Infrastructure.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Xunit;

using System.Net;
using System.Text.Json;
using TestSupport;
using Domain.Entities;
using Domain.ValueObjects;
using Infrastructure.Data;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public sealed class AdminControllerIntegrationTests
{
    [Fact]
    public async Task GetDashboard_ReturnsAggregates()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Dashboard post");
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Get,
            "/api/admin/dashboard",
            seeded.AdminId,
            role: "Admin");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        Assert.True(json.RootElement.GetProperty("totalUsers").GetInt32() >= 3);
        Assert.True(json.RootElement.GetProperty("federatedInstances").GetInt32() >= 1);
    }

    [Fact]
    public async Task GetUsers_ReturnsSeededUsersFromDatabase()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Get,
            "/api/admin/users?page=1&pageSize=10",
            seeded.AdminId,
            role: "Admin");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        int totalCount = json.RootElement.GetProperty("totalCount").GetInt32();
        Assert.True(totalCount >= 3);
    }

    [Fact]
    public async Task UpdateUserRole_ChangesIdentityRole()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/users/{seeded.OtherId}/role",
            seeded.AdminId,
            role: "Admin",
            body: new { role = "Admin" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using IServiceScope scope = host.App.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Guid? adminRoleId = await db.Roles
            .Where(r => r.Name == "Admin")
            .Select(r => (Guid?)r.Id)
            .SingleOrDefaultAsync();

        Assert.NotNull(adminRoleId);

        bool hasAdminRole = await db.UserRoles
            .AnyAsync(ur => ur.UserId == seeded.OtherId && ur.RoleId == adminRoleId.Value);

        Assert.True(hasAdminRole);
    }

    [Fact]
    public async Task UpdateUserStatus_Suspended_ChangesDomainUserState()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/users/{seeded.ArtistId}/status",
            seeded.AdminId,
            role: "Admin",
            body: new { status = "Suspended" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using IServiceScope scope = host.App.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Domain.Entities.User? user = await db.DomainUsers.SingleOrDefaultAsync(x => x.Id == seeded.ArtistId);

        Assert.NotNull(user);
        Assert.True(user!.IsDisabled);
    }

    [Fact]
    public async Task GetReports_ReturnsAggregates()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Reports post");
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Get,
            "/api/admin/reports",
            seeded.AdminId,
            role: "Admin");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        Assert.True(json.RootElement.GetProperty("totalPublications").GetInt32() >= 1);
        Assert.True(json.RootElement.GetProperty("federationInteractions").GetInt32() >= 1);
    }

    [Fact]
    public async Task GetPostModerationReports_ReturnsSeededPendingReport()
    {
        TestDataSeeder.SeededUsers seeded = default!;
        Guid reportId = Guid.Empty;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                Guid postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "post for moderation list");
                reportId = await TestDataSeeder.SeedPostModerationReportAsync(services, postId, seeded.OtherId, reason: "Spam");
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Get,
            "/api/admin/reports/posts?status=Pending&page=1&pageSize=20",
            seeded.AdminId,
            role: "Admin");

        response.EnsureSuccessStatusCode();
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement items = json.RootElement.GetProperty("items");

        Assert.True(items.GetArrayLength() >= 1);
        Assert.Contains(items.EnumerateArray(), item => item.GetProperty("id").GetGuid() == reportId);
    }

    [Fact]
    public async Task EvaluatePostModerationReport_DeletePost_ResolvesReportAndSoftDeletesPost()
    {
        TestDataSeeder.SeededUsers seeded = default!;
        Guid postId = Guid.Empty;
        Guid reportId = Guid.Empty;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "post to be removed");
                reportId = await TestDataSeeder.SeedPostModerationReportAsync(services, postId, seeded.OtherId, reason: "Harassment");
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/reports/posts/{reportId}/evaluate",
            seeded.AdminId,
            role: "Admin",
            body: new {
                action = "DeletePost",
                moderatorNote = "Violation confirmed"
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/admin/dashboard",
                seeded.AdminId,
                "Admin");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.True(json.RootElement.GetProperty("totalUsers").GetInt32() >= 3);
            Assert.True(json.RootElement.GetProperty("federatedInstances").GetInt32() >= 1);
        }

    [Fact]
    public async Task GetConfiguration_ReturnsPersistedDefaults()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Get,
            "/api/admin/configuration",
            seeded.AdminId,
            role: "Admin");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        Assert.Equal("Krea Test", json.RootElement.GetProperty("platformName").GetString());
        Assert.Equal("admin@test.local", json.RootElement.GetProperty("administratorEmail").GetString());
    }

    [Fact]
    public async Task UpdateConfiguration_UpdatesDatabase()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Put,
            "/api/admin/configuration",
            seeded.AdminId,
            role: "Admin",
            body: new {
                platformName = "Krea Updated",
                description = "Updated description",
                administratorEmail = "ops@krea.local"
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/admin/users?page=1&pageSize=10",
                seeded.AdminId,
                "Admin");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            int totalCount = json.RootElement.GetProperty("totalCount").GetInt32();
            Assert.True(totalCount >= 3);
        }

        [Fact]
        public async Task UpdateUserRole_ChangesIdentityRole() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Patch,
                $"/api/admin/users/{seeded.OtherId}/role",
                seeded.AdminId,
                "Admin",
                new { role = "Admin" });

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Guid? adminRoleId = await db.Roles
                                        .Where(r => r.Name == "Admin")
                                        .Select(r => (Guid?)r.Id)
                                        .SingleOrDefaultAsync();

            Assert.NotNull(adminRoleId);

            bool hasAdminRole = await db.UserRoles
                                        .AnyAsync(ur => ur.UserId == seeded.OtherId && ur.RoleId == adminRoleId.Value);

            Assert.True(hasAdminRole);
        }

        [Fact]
        public async Task UpdateUserStatus_Suspended_ChangesDomainUserState() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Patch,
                $"/api/admin/users/{seeded.ArtistId}/status",
                seeded.AdminId,
                "Admin",
                new { status = "Suspended" });

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            User? user = await db.DomainUsers.SingleOrDefaultAsync(x => x.Id == seeded.ArtistId);

            Assert.NotNull(user);
            Assert.True(user!.IsDisabled);
        }

        [Fact]
        public async Task GetReports_ReturnsAggregates() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Reports post");
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/admin/reports",
                seeded.AdminId,
                "Admin");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.True(json.RootElement.GetProperty("totalPublications").GetInt32() >= 1);
            Assert.True(json.RootElement.GetProperty("federationInteractions").GetInt32() >= 1);
        }

        [Fact]
        public async Task GetPostModerationReports_ReturnsSeededPendingReport() {
            TestDataSeeder.SeededUsers seeded = default!;
            var reportId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                Guid postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "post for moderation list");
                reportId = await TestDataSeeder.SeedPostModerationReportAsync(services, postId, seeded.OtherId, "Spam");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/admin/reports/posts?status=Pending&page=1&pageSize=20",
                seeded.AdminId,
                "Admin");

            response.EnsureSuccessStatusCode();
            JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            JsonElement items = json.RootElement.GetProperty("items");

            Assert.True(items.GetArrayLength() >= 1);
            Assert.Contains(items.EnumerateArray(), item => item.GetProperty("id").GetGuid() == reportId);
        }

        [Fact]
        public async Task EvaluatePostModerationReport_DeletePost_ResolvesReportAndSoftDeletesPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            var postId = Guid.Empty;
            var reportId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "post to be removed");
                reportId = await TestDataSeeder.SeedPostModerationReportAsync(services, postId, seeded.OtherId,
                    "Harassment");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Patch,
                $"/api/admin/reports/posts/{reportId}/evaluate",
                seeded.AdminId,
                "Admin",
                new { action = "DeletePost", moderatorNote = "Violation confirmed" });

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            PostModerationReport? report = await db.PostModerationReports.FirstOrDefaultAsync(r => r.Id == reportId);
            Post? post = await db.Posts.FirstOrDefaultAsync(p => p.Id == postId);

            Assert.NotNull(report);
            Assert.Equal(PostModerationReportStatus.Resolved, report!.Status);
            Assert.Equal(PostModerationDecisionAction.DeletePost, report.ResolvedAction);
            Assert.NotNull(report.ResolvedAt);

            Assert.NotNull(post);
            Assert.True(post!.IsDeleted);
        }

        [Fact]
        public async Task GetConfiguration_ReturnsPersistedDefaults() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/admin/configuration",
                seeded.AdminId,
                "Admin");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.Equal("Krea Test", json.RootElement.GetProperty("platformName").GetString());
            Assert.Equal("admin@test.local", json.RootElement.GetProperty("administratorEmail").GetString());
        }

        [Fact]
        public async Task UpdateConfiguration_UpdatesDatabase() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Put,
                "/api/admin/configuration",
                seeded.AdminId,
                "Admin",
                new {
                    platformName = "Krea Updated",
                    description = "Updated description",
                    administratorEmail = "ops@krea.local"
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            InstanceConfiguration? config = await db.InstanceConfigurations
                                                    .OrderByDescending(x => x.UpdatedAt)
                                                    .FirstOrDefaultAsync();

            Assert.NotNull(config);
            Assert.Equal("Krea Updated", config!.PlatformName);
            Assert.Equal("Updated description", config.Description);
            Assert.Equal("ops@krea.local", config.AdministratorEmail);
        }

        [Fact]
        public async Task DeleteUser_RemovesDomainAndIdentityUser() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Delete,
                $"/api/admin/users/{seeded.OtherId}",
                seeded.AdminId,
                "Admin");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            User? domainUser = await db.DomainUsers.SingleOrDefaultAsync(u => u.Id == seeded.OtherId);
            Assert.Null(domainUser);

            AppUser? identityUser = await db.Users.SingleOrDefaultAsync(u => u.Id == seeded.OtherId);
            Assert.Null(identityUser);
        }
    }

    [Fact]
    public async Task DeleteUser_RemovesDomainAndIdentityUser()
    {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

        HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Delete,
            $"/api/admin/users/{seeded.OtherId}",
            seeded.AdminId,
            role: "Admin");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using IServiceScope scope = host.App.Services.CreateScope();
        AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Domain.Entities.User? domainUser = await db.DomainUsers.SingleOrDefaultAsync(u => u.Id == seeded.OtherId);
        Assert.Null(domainUser);

        AppUser? identityUser = await db.Users.SingleOrDefaultAsync(u => u.Id == seeded.OtherId);
        Assert.Null(identityUser);
    }
}
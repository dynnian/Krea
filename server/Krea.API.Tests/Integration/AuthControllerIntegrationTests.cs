namespace Krea.API.Tests.Integration {
    using Infrastructure.Data;
    using Infrastructure.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using System.Net;
    using System.Net.Http.Json;
    using System.Text.Json;
    using TestSupport;
    using Xunit;

    [Collection(IntegrationTestCollection.Name)]
    public sealed class AuthControllerIntegrationTests(PostgresContainerFixture postgres) {
        private readonly PostgresContainerFixture _postgres = postgres;

        [Fact]
        public async Task Register_PersistsIdentityAndDomainUser() {
            await using var host =
                await IntegrationTestHost.CreateAsync(_postgres, seed: TestDataSeeder.SeedRolesOnlyAsync);

            HttpResponseMessage response = await host.Client.PostAsJsonAsync("/api/auth/register",
                new {
                    username = "newuser",
                    email = "newuser@test.local",
                    password = "Admin123!",
                    displayName = "New User",
                    languageCode = "en",
                    timeZoneId = "UTC",
                    biography = "A short bio"
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            AppUser? appUser = await db.Users.SingleOrDefaultAsync(u => u.UserName == "newuser");
            Assert.NotNull(appUser);

            Domain.Entities.User? domainUser =
                await db.DomainUsers.SingleOrDefaultAsync(u => u.Id == appUser!.Id);
            Assert.NotNull(domainUser);
            Assert.Equal("New User", domainUser!.DisplayName);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);
            Assert.True(json.RootElement.TryGetProperty("token", out _));
        }

        [Fact]
        public async Task Login_ReturnsTokenForValidCredentials() {
            await using var host = await IntegrationTestHost.CreateAsync(_postgres, seed: async services => {
                await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await host.Client.PostAsJsonAsync("/api/auth/login",
                new { emailOrUsername = "admin", password = "Admin123!" });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.TryGetProperty("token", out _));
        }

        [Fact]
        public async Task ConfirmEmail_WithInvalidToken_ReturnsBadRequest() {
            await using var host =
                await IntegrationTestHost.CreateAsync(_postgres, seed: TestDataSeeder.SeedRolesOnlyAsync);

            HttpResponseMessage response = await host.Client.GetAsync(
                $"/api/auth/confirm-email?userId={Guid.NewGuid()}&token=invalid-token");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task RefreshToken_WithoutCookie_ReturnsUnauthorized() {
            await using var host =
                await IntegrationTestHost.CreateAsync(_postgres, seed: TestDataSeeder.SeedRolesOnlyAsync);

            HttpResponseMessage response =
                await host.Client.PostAsJsonAsync("/api/auth/refresh-token", new { });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task RevokeToken_WithoutCookie_ReturnsOk_WhenAuthenticated() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, seed: async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/auth/revoke-token",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task ChangePassword_WithMismatchedUserId_ReturnsUnauthorized() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, seed: async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/auth/change-password",
                seeded.AdminId,
                "Artist",
                new { userId = seeded.ArtistId, currentPassword = "Admin123!", newPassword = "Admin123!x" });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
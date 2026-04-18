namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Net.Http.Json;
    using System.Text.Json;
    using TestSupport;
    using Infrastructure.Data;
    using Infrastructure.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Xunit;

    public sealed class AuthControllerIntegrationTests {
        [Fact]
        public async Task Register_PersistsIdentityAndDomainUser() {
            await using var host = await IntegrationTestHost.CreateAsync(TestDataSeeder.SeedRolesOnlyAsync);

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

            Domain.Entities.User? domainUser = await db.DomainUsers.SingleOrDefaultAsync(u => u.Id == appUser!.Id);
            Assert.NotNull(domainUser);
            Assert.Equal("New User", domainUser!.DisplayName);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);
            Assert.True(json.RootElement.TryGetProperty("token", out _));
        }
    }
}
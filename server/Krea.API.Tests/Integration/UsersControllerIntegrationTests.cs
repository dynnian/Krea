namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text.Json;
    using TestSupport;
    using Microsoft.Extensions.DependencyInjection;
    using Xunit;

    [Collection(IntegrationTestCollection.Name)]
    public sealed class UsersControllerIntegrationTests {
        private readonly PostgresContainerFixture _postgres;

public sealed class UsersControllerIntegrationTests {
    [Fact]
    public async Task PublicProfile_ReturnsSeededUserData() {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(seed: async services => {
            seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
        });

        HttpResponseMessage response = await host.Client.GetAsync($"/api/users/{seeded.ArtistId}/profile");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        Assert.Equal(seeded.ArtistId, json.RootElement.GetProperty("id").GetGuid());
        Assert.Equal("artist", json.RootElement.GetProperty("username").GetString());
        Assert.Equal("Artist Tester", json.RootElement.GetProperty("displayName").GetString());
    }

    [Fact]
    public async Task FollowAndUnfollow_ChangesDatabaseState() {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(seed: async services => {
            seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
        });

        HttpResponseMessage followResponse = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Post,
            $"/api/users/{seeded.ArtistId}/follow",
            seeded.AdminId,
            role: "Artist");

        Assert.Equal(HttpStatusCode.NoContent, followResponse.StatusCode);

        using (IServiceScope scope = host.App.Services.CreateScope()) {
            int followCount = await TestDataSeeder.CountFollowsAsync(scope.ServiceProvider, seeded.AdminId, seeded.ArtistId);
            Assert.Equal(1, followCount);
        }

        [Fact]
        public async Task PublicProfile_ReturnsSeededUserData() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await host.Client.GetAsync($"/api/users/{seeded.ArtistId}/profile");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.Equal(seeded.ArtistId, json.RootElement.GetProperty("id").GetGuid());
            Assert.Equal("artist", json.RootElement.GetProperty("username").GetString());
            Assert.Equal("Artist Tester", json.RootElement.GetProperty("displayName").GetString());
        }

        [Fact]
        public async Task FollowAndUnfollow_ChangesDatabaseState() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage followResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/users/{seeded.ArtistId}/follow",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.NoContent, followResponse.StatusCode);

            using (IServiceScope scope = host.App.Services.CreateScope()) {
                int followCount =
                    await TestDataSeeder.CountFollowsAsync(scope.ServiceProvider, seeded.AdminId, seeded.ArtistId);
                Assert.Equal(1, followCount);
            }

            HttpResponseMessage unfollowResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Delete,
                $"/api/users/{seeded.ArtistId}/unfollow",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.NoContent, unfollowResponse.StatusCode);

            using IServiceScope verifyScope = host.App.Services.CreateScope();
            int remaining =
                await TestDataSeeder.CountFollowsAsync(verifyScope.ServiceProvider, seeded.AdminId, seeded.ArtistId);
            Assert.Equal(0, remaining);
        }

        [Fact]
        public async Task GetMyProfile_ReturnsAuthenticatedUserProfile() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/users/me/profile",
                seeded.ArtistId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal(seeded.ArtistId, json.RootElement.GetProperty("id").GetGuid());
        }

        [Fact]
        public async Task PatchMyProfile_UpdatesDisplayName() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Patch,
                "/api/users/me/profile",
                seeded.ArtistId,
                "Artist",
                new { displayName = "Artist Updated" });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal("Artist Updated", json.RootElement.GetProperty("displayName").GetString());
        }

        [Fact]
        public async Task GetMyFollowers_ReturnsFollowers() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/users/me/followers?page=1&pageSize=20",
                seeded.ArtistId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetProperty("totalCount").GetInt32() >= 1);
        }

        [Fact]
        public async Task GetMyFollowing_ReturnsFollowingUsers() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/users/me/following?page=1&pageSize=20",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetProperty("totalCount").GetInt32() >= 1);
        }

        [Fact]
        public async Task GetUserFollowers_ReturnsPublicFollowers() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

            HttpResponseMessage response =
                await host.Client.GetAsync($"/api/users/{seeded.ArtistId}/followers?page=1&pageSize=20");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetUserFollowing_ReturnsPublicFollowing() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            });

            HttpResponseMessage response =
                await host.Client.GetAsync($"/api/users/{seeded.AdminId}/following?page=1&pageSize=20");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task SearchUsers_ReturnsMatchingUsers() {
            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await host.Client.GetAsync("/api/users/search?query=art&page=1&pageSize=10");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetProperty("items").GetArrayLength() >= 1);
        }

        [Fact]
        public async Task UploadMyProfilePicture_WithoutFile_ReturnsBadRequest() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            using var request = IntegrationTestHost.CreateAuthenticatedRequest(
                HttpMethod.Post,
                "/api/users/me/profile-picture",
                seeded.AdminId,
                "Artist",
                new MultipartFormDataContent());

            HttpResponseMessage response = await host.Client.SendAsync(request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UploadMyProfilePicture_WithValidFile_ReturnsOk() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            using var form = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4 });
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(fileContent, "file", "avatar.png");

            using var request = IntegrationTestHost.CreateAuthenticatedRequest(
                HttpMethod.Post,
                "/api/users/me/profile-picture",
                seeded.AdminId,
                "Artist",
                form);

            HttpResponseMessage response = await host.Client.SendAsync(request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.TryGetProperty("mediaId", out _));
            Assert.True(json.RootElement.TryGetProperty("url", out _));
        }
    }
}
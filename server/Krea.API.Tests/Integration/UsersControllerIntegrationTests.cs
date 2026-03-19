namespace Krea.API.Tests.Integration;

using System.Net;
using System.Text.Json;
using Krea.API.Tests.TestSupport;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

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

        HttpResponseMessage unfollowResponse = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Delete,
            $"/api/users/{seeded.ArtistId}/unfollow",
            seeded.AdminId,
            role: "Artist");

        Assert.Equal(HttpStatusCode.NoContent, unfollowResponse.StatusCode);

        using IServiceScope verifyScope = host.App.Services.CreateScope();
        int remaining = await TestDataSeeder.CountFollowsAsync(verifyScope.ServiceProvider, seeded.AdminId, seeded.ArtistId);
        Assert.Equal(0, remaining);
    }
}

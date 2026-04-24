namespace Krea.API.Tests.Integration;

using System.Net;
using System.Text.Json;
using Krea.API.Tests.TestSupport;
using Xunit;

public sealed class FeedControllerIntegrationTests {
    [Fact]
    public async Task RecentFeed_ReturnsSeededPost() {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(seed: async services => {
            seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Feed post");
        });

        HttpResponseMessage response = await host.Client.GetAsync($"/api/feed/recent?currentUserId={seeded.AdminId}&page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        Assert.True(json.RootElement.GetArrayLength() >= 1);
        Assert.Contains(json.RootElement.EnumerateArray(), item => item.GetProperty("title").GetString() == "Feed post");
    }

    [Fact]
    public async Task FollowingFeed_ReturnsPostsFromFollowedUsers() {
        TestDataSeeder.SeededUsers seeded = default!;

        await using var host = await IntegrationTestHost.CreateAsync(seed: async services => {
            seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            await TestDataSeeder.SeedFollowAsync(services, seeded.AdminId, seeded.ArtistId);
            await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Followed user post");
            await TestDataSeeder.SeedPostAsync(services, seeded.OtherId, "Other user post");
        });

        HttpResponseMessage response = await host.Client.GetAsync($"/api/feed/following?currentUserId={seeded.AdminId}&page=1&pageSize=20");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        string body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        Assert.Contains(json.RootElement.EnumerateArray(), item => item.GetProperty("title").GetString() == "Followed user post");
        Assert.DoesNotContain(json.RootElement.EnumerateArray(), item => item.GetProperty("title").GetString() == "Other user post");
    }
}

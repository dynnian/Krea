namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Text.Json;
    using TestSupport;
    using Xunit;

    [Collection(IntegrationTestCollection.Name)]
    public sealed class FeedControllerIntegrationTests(PostgresContainerFixture postgres) {
        private readonly PostgresContainerFixture _postgres = postgres;

        [Fact]
        public async Task GetRecentFeed_ReturnsSeededPosts() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres,
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                    await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Test feed post");
                });

            HttpResponseMessage response =
                await host.Client.GetAsync($"/api/feed/recent?currentUserId={seeded.AdminId}&page=1&pageSize=10");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.True(json.RootElement.GetArrayLength() >= 1);
        }
    }
}
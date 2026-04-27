namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Text.Json;
    using TestSupport;
    using Xunit;

    public sealed class DirectMessagesControllerIntegrationTests {
        [Fact]
        public async Task SendMessage_ThenGetConversations_ReturnsCreatedConversation() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            HttpResponseMessage sendResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/directmessages",
                seeded.AdminId,
                "Artist",
                new {
                    senderId = seeded.AdminId, receiverId = seeded.ArtistId, content = "Hello from integration test"
                });

            Assert.Equal(HttpStatusCode.Created, sendResponse.StatusCode);

            HttpResponseMessage conversationsResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/directmessages/conversations",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, conversationsResponse.StatusCode);

            string body = await conversationsResponse.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.True(json.RootElement.GetArrayLength() >= 1);
            Assert.Contains(json.RootElement.EnumerateArray(),
                item => item.GetProperty("otherParticipantId").GetGuid() == seeded.ArtistId);
        }
    }
}
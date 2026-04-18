namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Linq;
    using System.Text.Json;
    using TestSupport;
    using Xunit;

    [Collection(IntegrationTestCollection.Name)]
    public sealed class DirectMessagesControllerIntegrationTests {
        private readonly PostgresContainerFixture _postgres;

        public DirectMessagesControllerIntegrationTests(PostgresContainerFixture postgres) {
            _postgres = postgres;
        }

        [Fact]
        public async Task SendMessage_ThenGetConversations_ReturnsCreatedConversation() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
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

        [Fact]
        public async Task GetConversation_ReturnsMessagesWithOtherUser() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage sendResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/directmessages",
                seeded.AdminId,
                "Artist",
                new { senderId = seeded.AdminId, receiverId = seeded.ArtistId, content = "Conversation lookup" });

            Assert.Equal(HttpStatusCode.Created, sendResponse.StatusCode);

            HttpResponseMessage conversationResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                $"/api/directmessages/{seeded.ArtistId}?page=1&pageSize=20",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, conversationResponse.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await conversationResponse.Content.ReadAsStringAsync());
            Assert.Equal(seeded.ArtistId, json.RootElement.GetProperty("otherParticipantId").GetGuid());
            Assert.True(json.RootElement.GetProperty("messages").GetArrayLength() >= 1);
        }

        [Fact]
        public async Task GetConversationMessages_ReturnsPagedMessagesByConversationId() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage sendResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/directmessages",
                seeded.AdminId,
                "Artist",
                new {
                    senderId = seeded.AdminId,
                    receiverId = seeded.ArtistId,
                    content = "Conversation messages endpoint"
                });

            Assert.Equal(HttpStatusCode.Created, sendResponse.StatusCode);

            HttpResponseMessage conversationsResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/directmessages/conversations",
                seeded.AdminId,
                "Artist");

            using JsonDocument conversationsJson =
                JsonDocument.Parse(await conversationsResponse.Content.ReadAsStringAsync());

            Guid conversationId = conversationsJson.RootElement
                                                 .EnumerateArray()
                                                 .First(item =>
                                                     item.GetProperty("otherParticipantId").GetGuid() == seeded.ArtistId)
                                                 .GetProperty("conversationId")
                                                 .GetGuid();

            HttpResponseMessage messagesResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                $"/api/directmessages/conversations/{conversationId}/messages?page=1&pageSize=20",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, messagesResponse.StatusCode);

            using JsonDocument messagesJson = JsonDocument.Parse(await messagesResponse.Content.ReadAsStringAsync());
            Assert.True(messagesJson.RootElement.GetArrayLength() >= 1);
        }

        [Fact]
        public async Task MarkAsRead_ReturnsOkForConversationParticipant() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage sendResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/directmessages",
                seeded.AdminId,
                "Artist",
                new {
                    senderId = seeded.AdminId,
                    receiverId = seeded.ArtistId,
                    content = "Mark read integration test"
                });

            Assert.Equal(HttpStatusCode.Created, sendResponse.StatusCode);

            using JsonDocument messageJson = JsonDocument.Parse(await sendResponse.Content.ReadAsStringAsync());
            Guid messageId = messageJson.RootElement.GetProperty("id").GetGuid();

            HttpResponseMessage markReadResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Patch,
                $"/api/directmessages/{messageId}/read",
                seeded.ArtistId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, markReadResponse.StatusCode);
        }
    }
}
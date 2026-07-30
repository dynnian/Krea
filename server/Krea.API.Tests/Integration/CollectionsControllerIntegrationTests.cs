namespace Krea.API.Tests.Integration {
    using Infrastructure.Data;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text.Json;
    using TestSupport;
    using Xunit;

    public sealed class CollectionsControllerIntegrationTests {
        [Fact]
        public async Task CreateCollection_ReturnsCreatedAndPersistsCollection() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            using MultipartFormDataContent form =
                BuildCreateCollectionForm("My Collection", "Integration description", 0);
            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Post,
                "/api/collections",
                seeded.AdminId,
                "Artist",
                form);

            HttpResponseMessage response = await host.Client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Guid collectionId = json.RootElement.GetProperty("id").GetGuid();

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.Collections.AnyAsync(c => c.Id == collectionId && c.OwnerId == seeded.AdminId);
            Assert.True(exists);
        }

        [Fact]
        public async Task GetUserCollections_ReturnsCollectionsForUser() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Get,
                $"/api/collections/user/{seeded.AdminId}",
                seeded.AdminId,
                "Artist");

            HttpResponseMessage response = await host.Client.SendAsync(request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Contains(json.RootElement.EnumerateArray(),
                item => item.GetProperty("id").GetGuid() == collectionId);
        }

        [Fact]
        public async Task GetCollection_ReturnsCollectionDetail() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Get,
                $"/api/collections/{collectionId}?page=1&pageSize=20",
                seeded.AdminId,
                "Artist");

            HttpResponseMessage response = await host.Client.SendAsync(request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal(collectionId, json.RootElement.GetProperty("id").GetGuid());
        }

        [Fact]
        public async Task AddPostAndRemovePost_WorksForCollection() {
            TestDataSeeder.SeededUsers seeded = default!;
            var postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                    postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Collection post");
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            HttpResponseMessage addResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/collections/{collectionId}/posts",
                seeded.AdminId,
                "Artist",
                new { postId });

            Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

            using IServiceScope addScope = host.App.Services.CreateScope();
            var addDb = addScope.ServiceProvider.GetRequiredService<AppDbContext>();
            int countAfterAdd = await addDb.Collections.Where(c => c.Id == collectionId).Select(c => c.ItemCount)
                                           .SingleAsync();
            Assert.Equal(1, countAfterAdd);

            using HttpRequestMessage removeRequest = CreateAuthenticatedRequest(
                HttpMethod.Delete,
                $"/api/collections/{collectionId}/posts/{postId}",
                seeded.AdminId,
                "Artist");

            HttpResponseMessage removeResponse = await host.Client.SendAsync(removeRequest);
            Assert.Equal(HttpStatusCode.NoContent, removeResponse.StatusCode);

            using IServiceScope removeScope = host.App.Services.CreateScope();
            var removeDb = removeScope.ServiceProvider.GetRequiredService<AppDbContext>();
            int countAfterRemove = await removeDb.Collections.Where(c => c.Id == collectionId).Select(c => c.ItemCount)
                                                 .SingleAsync();
            Assert.Equal(0, countAfterRemove);
        }

        [Fact]
        public async Task UpdateTitle_UpdatesCollectionTitle() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Put,
                $"/api/collections/{collectionId}/title",
                seeded.AdminId,
                "Artist",
                new { title = "Updated Collection Title" });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal("Updated Collection Title", json.RootElement.GetProperty("title").GetString());
        }

        [Fact]
        public async Task DeleteCollection_RemovesCollection() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Delete,
                $"/api/collections/{collectionId}",
                seeded.AdminId,
                "Artist");

            HttpResponseMessage response = await host.Client.SendAsync(request);
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.Collections.AnyAsync(c => c.Id == collectionId);
            Assert.False(exists);
        }

        [Fact]
        public async Task UploadCover_WithoutFile_ReturnsBadRequest() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Post,
                $"/api/collections/{collectionId}/cover",
                seeded.AdminId,
                "Artist",
                new MultipartFormDataContent());

            HttpResponseMessage response = await host.Client.SendAsync(request);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UploadCover_WithValidFile_ReturnsOk() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(
                seed: async services => {
                    seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                });

            Guid collectionId = await CreateCollectionAsync(host, seeded.AdminId);

            using var form = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, 10, 20, 30, 40 });
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(fileContent, "file", "cover.png");

            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Post,
                $"/api/collections/{collectionId}/cover",
                seeded.AdminId,
                "Artist",
                form);

            HttpResponseMessage response = await host.Client.SendAsync(request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.TryGetProperty("mediaId", out JsonElement mediaId));
            Assert.True(json.RootElement.TryGetProperty("url", out JsonElement url));
            Assert.NotEqual(Guid.Empty, mediaId.GetGuid());
            Assert.False(string.IsNullOrWhiteSpace(url.GetString()));
        }

        // Helper methods
        private static MultipartFormDataContent BuildCreateCollectionForm(string title, string description, int type) {
            var form = new MultipartFormDataContent();
            form.Add(new StringContent(title), "Title");
            form.Add(new StringContent(description), "Description");
            form.Add(new StringContent(type.ToString()), "Type");
            return form;
        }

        private static async Task<Guid> CreateCollectionAsync(IntegrationTestHost host, Guid userId) {
            using MultipartFormDataContent form = BuildCreateCollectionForm("Seed collection", "Seed desc", 0);
            using HttpRequestMessage request = CreateAuthenticatedRequest(
                HttpMethod.Post,
                "/api/collections",
                userId,
                "Artist",
                form);

            HttpResponseMessage response = await host.Client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return json.RootElement.GetProperty("id").GetGuid();
        }

        private static HttpRequestMessage CreateAuthenticatedRequest(
            HttpMethod method,
            string url,
            Guid userId,
            string role,
            HttpContent? content = null) {
            var request = new HttpRequestMessage(method, url);
            request.Headers.Add(TestAuthHandler.HeaderName,
                role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? "admin" : "user");
            request.Headers.Add(TestAuthHandler.UserIdHeaderName, userId.ToString());
            if (content != null)
                request.Content = content;
            return request;
        }
    }
}
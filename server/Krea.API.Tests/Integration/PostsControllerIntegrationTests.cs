namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Text.Json;
    using TestSupport;
    using Infrastructure.Data;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Xunit;

    public sealed class PostsControllerIntegrationTests {
        [Fact]
        public async Task GetById_ReturnsSeededPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            var postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Seeded post");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                $"/api/posts/{postId}",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            string body = await response.Content.ReadAsStringAsync();
            using JsonDocument json = JsonDocument.Parse(body);

            Assert.Equal(postId, json.RootElement.GetProperty("id").GetGuid());
            Assert.Equal("Seeded post", json.RootElement.GetProperty("title").GetString());
        }

        [Fact]
        public async Task CreatePost_PersistsPost() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                "/api/posts",
                seeded.ArtistId,
                "Artist",
                new {
                    authorPostId = seeded.ArtistId,
                    type = 0,
                    title = "Created from test",
                    content = "Body",
                    isWork = false,
                    isLocal = true
                });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            bool exists =
                await db.Posts.AnyAsync(p => p.Title == "Created from test" && p.AuthorPostId == seeded.ArtistId);
            Assert.True(exists);
        }
    }
}
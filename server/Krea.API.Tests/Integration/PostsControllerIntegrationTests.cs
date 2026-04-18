namespace Krea.API.Tests.Integration {
    using System.Net;
    using System.Net.Http.Headers;
    using System.Net.Http.Json;
    using System.Text;
    using System.Text.Json;
    using Domain.Entities;
    using Domain.ValueObjects;
    using TestSupport;
    using Infrastructure.Data;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Xunit;

    [Collection(IntegrationTestCollection.Name)]
    public sealed class PostsControllerIntegrationTests {
        private readonly PostgresContainerFixture _postgres;

        public PostsControllerIntegrationTests(PostgresContainerFixture postgres) {
            _postgres = postgres;
        }

        [Fact]
        public async Task GetById_ReturnsSeededPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            var postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
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

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
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

        [Fact]
        public async Task GetAll_ReturnsSeededPosts() {
            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                TestDataSeeder.SeededUsers seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "All posts - one");
                await TestDataSeeder.SeedPostAsync(services, seeded.OtherId, "All posts - two");
            });

            HttpResponseMessage response = await host.Client.GetAsync("/api/posts?page=1&pageSize=20");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetArrayLength() >= 2);
        }

        [Fact]
        public async Task GetByUser_ReturnsOnlyRequestedAuthorPosts() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Artist timeline post");
                await TestDataSeeder.SeedPostAsync(services, seeded.OtherId, "Other timeline post");
            });

            HttpResponseMessage response =
                await host.Client.GetAsync($"/api/posts/user/{seeded.ArtistId}?page=1&pageSize=20");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Contains(json.RootElement.EnumerateArray(), item =>
                item.GetProperty("title").GetString() == "Artist timeline post");
            Assert.DoesNotContain(json.RootElement.EnumerateArray(), item =>
                item.GetProperty("title").GetString() == "Other timeline post");
        }

        [Fact]
        public async Task DeletePost_SoftDeletesPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Post to delete");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Delete,
                $"/api/posts/{postId}",
                seeded.ArtistId,
                "Artist");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Post deleted = await db.Posts.SingleAsync(p => p.Id == postId);
            Assert.True(deleted.IsDeleted);
        }

        [Fact]
        public async Task Reply_CreatesReplyPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Parent post");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/reply",
                seeded.AdminId,
                "Artist",
                new {
                    replyToPostId = postId,
                    authorId = seeded.AdminId,
                    title = "Reply title",
                    content = "Reply content"
                });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.Posts.AnyAsync(p => p.RepliedToId == postId && p.AuthorPostId == seeded.AdminId);
            Assert.True(exists);
        }

        [Fact]
        public async Task GetReplies_ReturnsFlatReplies() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Post with replies");
            });

            HttpResponseMessage createReplyResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/reply",
                seeded.AdminId,
                "Artist",
                new {
                    replyToPostId = postId,
                    authorId = seeded.AdminId,
                    title = "Reply one",
                    content = "Reply content"
                });

            Assert.Equal(HttpStatusCode.Created, createReplyResponse.StatusCode);

            HttpResponseMessage response = await host.Client.GetAsync($"/api/posts/{postId}/replies?mode=Flat&page=1&pageSize=10");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal("flat", json.RootElement.GetProperty("mode").GetString());
            Assert.True(json.RootElement.GetProperty("flat").GetProperty("items").GetArrayLength() >= 1);
        }

        [Fact]
        public async Task Repost_CreatesRepost() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid originalPostId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                originalPostId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Original post");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{originalPostId}/repost",
                seeded.AdminId,
                "Artist",
                new {
                    authorId = seeded.AdminId,
                    originalPostId
                });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.Posts.AnyAsync(p => p.RepostOfId == originalPostId && p.AuthorPostId == seeded.AdminId);
            Assert.True(exists);
        }

        [Fact]
        public async Task LikePost_AddsLike() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Likeable post");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/like",
                seeded.AdminId,
                "Artist",
                new { postId, userId = seeded.AdminId });

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.Likes.AnyAsync(l => l.PostId == postId && l.UserId == seeded.AdminId);
            Assert.True(exists);
        }

        [Fact]
        public async Task UnlikePost_RemovesLike() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Like then unlike");
            });

            HttpResponseMessage likeResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/like",
                seeded.AdminId,
                "Artist",
                new { postId, userId = seeded.AdminId });
            Assert.Equal(HttpStatusCode.NoContent, likeResponse.StatusCode);

            HttpResponseMessage unlikeResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Delete,
                $"/api/posts/{postId}/unlike",
                seeded.AdminId,
                "Artist",
                new { postId, userId = seeded.AdminId });

            Assert.Equal(HttpStatusCode.NoContent, unlikeResponse.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.Likes.AnyAsync(l => l.PostId == postId && l.UserId == seeded.AdminId);
            Assert.False(exists);
        }

        [Fact]
        public async Task Explore_ReturnsPagedResult() {
            TestDataSeeder.SeededUsers seeded = default!;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Explore target");
            });

            HttpResponseMessage response = await host.Client.GetAsync("/api/posts/explore?page=1&pageSize=10");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.TryGetProperty("items", out _));
        }

        [Fact]
        public async Task AddHashtag_AddsTagToPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Hashtag post");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/hashtags",
                seeded.ArtistId,
                "Artist",
                new { name = "IntegrationTag" });

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Post post = await db.Posts.Include(p => p.Hashtags).SingleAsync(p => p.Id == postId);
            Assert.Contains(post.Hashtags, h => h.Name == "integrationtag");
        }

        [Fact]
        public async Task RemoveHashtag_RemovesTagFromPost() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Hashtag remove post");
            });

            HttpResponseMessage addResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/hashtags",
                seeded.ArtistId,
                "Artist",
                new { name = "RemoveTag" });

            Assert.Equal(HttpStatusCode.NoContent, addResponse.StatusCode);

            using (IServiceScope scope = host.App.Services.CreateScope()) {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                Guid hashtagId = await db.Hashtags.Where(h => h.Name == "removetag").Select(h => h.Id).SingleAsync();

                HttpResponseMessage removeResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                    host.Client,
                    HttpMethod.Delete,
                    $"/api/posts/{postId}/hashtags/{hashtagId}",
                    seeded.ArtistId,
                    "Artist");

                Assert.Equal(HttpStatusCode.NoContent, removeResponse.StatusCode);
            }

            using IServiceScope verifyScope = host.App.Services.CreateScope();
            var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
            Post post = await verifyDb.Posts.Include(p => p.Hashtags).SingleAsync(p => p.Id == postId);
            Assert.DoesNotContain(post.Hashtags, h => h.Name == "removetag");
        }

        [Fact]
        public async Task GetAllHashtags_ReturnsHashtags() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Hashtag list post");
            });

            HttpResponseMessage addResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/hashtags",
                seeded.ArtistId,
                "Artist",
                new { name = "ListTag" });
            Assert.Equal(HttpStatusCode.NoContent, addResponse.StatusCode);

            HttpResponseMessage getResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/posts/hashtags",
                seeded.ArtistId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await getResponse.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetArrayLength() >= 1);
        }

        [Fact]
        public async Task AddToFavorites_AddsFavoriteForCurrentUser() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Favorite target");
            });

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/favorite",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.PostFavorites.AnyAsync(f => f.PostId == postId && f.UserId == seeded.AdminId);
            Assert.True(exists);
        }

        [Fact]
        public async Task RemoveFromFavorites_RemovesFavoriteForCurrentUser() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Favorite remove target");
            });

            HttpResponseMessage addResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/favorite",
                seeded.AdminId,
                "Artist");
            Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

            HttpResponseMessage removeResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Delete,
                $"/api/posts/{postId}/favorite",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.NoContent, removeResponse.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            bool exists = await db.PostFavorites.AnyAsync(f => f.PostId == postId && f.UserId == seeded.AdminId);
            Assert.False(exists);
        }

        [Fact]
        public async Task GetFavorites_ReturnsFavoritedPosts() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Favorite listing target");
            });

            HttpResponseMessage addResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/favorite",
                seeded.AdminId,
                "Artist");
            Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Get,
                "/api/posts/me/favorites?page=1&pageSize=10",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetProperty("totalCount").GetInt32() >= 1);
        }

        [Fact]
        public async Task ToggleFavorite_TogglesFavoriteState() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Favorite toggle target");
            });

            HttpResponseMessage firstToggle = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/favorite/toggle",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, firstToggle.StatusCode);

            using JsonDocument firstJson = JsonDocument.Parse(await firstToggle.Content.ReadAsStringAsync());
            Assert.True(firstJson.RootElement.GetProperty("isFavorite").GetBoolean());

            HttpResponseMessage secondToggle = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/{postId}/favorite/toggle",
                seeded.AdminId,
                "Artist");

            Assert.Equal(HttpStatusCode.OK, secondToggle.StatusCode);

            using JsonDocument secondJson = JsonDocument.Parse(await secondToggle.Content.ReadAsStringAsync());
            Assert.False(secondJson.RootElement.GetProperty("isFavorite").GetBoolean());
        }

        [Fact]
        public async Task CreateUpload_WithoutAuthentication_ReturnsUnauthorized() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Upload target");
            });

            using var content = new MultipartFormDataContent();
            HttpResponseMessage response = await host.Client.PostAsync($"/api/posts/{postId}/uploads", content);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task AssignGenres_WithoutAuthentication_ReturnsUnauthorized() {
            await using var host = await IntegrationTestHost.CreateAsync(_postgres, TestDataSeeder.SeedRolesOnlyAsync);

            HttpResponseMessage response = await host.Client.PostAsJsonAsync(
                $"/api/posts/uploads/{Guid.NewGuid()}/genres",
                new { genreIds = new[] { Guid.NewGuid() } });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task CreateUpload_WithValidTextFile_ReturnsOk() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Upload happy path post");
            });

            using var form = new MultipartFormDataContent();
            var fileBytes = Encoding.UTF8.GetBytes("This is a text upload for integration testing.");
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            form.Add(fileContent, "File", "manuscript.txt");
            form.Add(new StringContent("text"), "Type");
            form.Add(new StringContent("Upload title"), "Title");
            form.Add(new StringContent("Upload description"), "Description");
            form.Add(new StringContent("false"), "IsWorkMedia");

            using var request = IntegrationTestHost.CreateAuthenticatedRequest(
                HttpMethod.Post,
                $"/api/posts/{postId}/uploads",
                seeded.ArtistId,
                "Artist",
                form);

            HttpResponseMessage response = await host.Client.SendAsync(request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.TryGetProperty("uploadId", out _));
            Assert.True(json.RootElement.TryGetProperty("mediaId", out _));
        }

        [Fact]
        public async Task AssignGenres_WithValidUploadAndGenres_ReturnsNoContent() {
            TestDataSeeder.SeededUsers seeded = default!;
            Guid postId = Guid.Empty;
            Guid genreId = Guid.Empty;

            await using var host = await IntegrationTestHost.CreateAsync(_postgres, async services => {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Assign genre post");

                var db = services.GetRequiredService<AppDbContext>();
                var genre = new Genre("Literature", GenreType.Text);
                db.Genres.Add(genre);
                await db.SaveChangesAsync();
                genreId = genre.Id;
            });

            using var form = new MultipartFormDataContent();
            var fileBytes = Encoding.UTF8.GetBytes("Genre assignment text upload sample");
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            form.Add(fileContent, "File", "genres.txt");
            form.Add(new StringContent("text"), "Type");
            form.Add(new StringContent("Genre upload"), "Title");
            form.Add(new StringContent("Genre upload desc"), "Description");
            form.Add(new StringContent("false"), "IsWorkMedia");

            using var uploadRequest = IntegrationTestHost.CreateAuthenticatedRequest(
                HttpMethod.Post,
                $"/api/posts/{postId}/uploads",
                seeded.ArtistId,
                "Artist",
                form);

            HttpResponseMessage uploadResponse = await host.Client.SendAsync(uploadRequest);
            Assert.Equal(HttpStatusCode.OK, uploadResponse.StatusCode);

            using JsonDocument uploadJson = JsonDocument.Parse(await uploadResponse.Content.ReadAsStringAsync());
            Guid uploadId = uploadJson.RootElement.GetProperty("uploadId").GetGuid();

            HttpResponseMessage assignResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                host.Client,
                HttpMethod.Post,
                $"/api/posts/uploads/{uploadId}/genres",
                seeded.ArtistId,
                "Artist",
                new { genreIds = new[] { genreId } });

            Assert.Equal(HttpStatusCode.NoContent, assignResponse.StatusCode);

            using IServiceScope scope = host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            PostUpload upload = await db.PostUploads
                                        .Include(u => u.Metadata)
                                        .ThenInclude(m => m!.Genres)
                                        .SingleAsync(u => u.Id == uploadId);

            Assert.NotNull(upload.Metadata);
            Assert.Contains(upload.Metadata!.Genres, g => g.Id == genreId);
        }
    }
}
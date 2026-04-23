namespace Krea.API.Tests.Integration;

using System.Net;
using System.Text.Json;
using TestSupport;
using Xunit;

public sealed class ReportsControllerIntegrationTests
{
    [Fact]
    public async Task CreatePostModerationReport_ReturnsCreatedReportData()
    {
        TestDataSeeder.SeededUsers seeded = default!;
        Guid postId = Guid.Empty;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Reported post");
            });

        var response = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Post,
            $"/api/posts/{postId}/reports",
            seeded.OtherId,
            "Artist",
            new { reason = "Spam", details = "Reported from integration test" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(postId, json.RootElement.GetProperty("postId").GetGuid());
        Assert.Equal(seeded.OtherId, json.RootElement.GetProperty("reporterUserId").GetGuid());
    }

    [Fact]
    public async Task GetMyReports_ReturnsSubmittedReports()
    {
        TestDataSeeder.SeededUsers seeded = default!;
        Guid postId = Guid.Empty;

        await using var host = await IntegrationTestHost.CreateAsync(
            seed: async services =>
            {
                seeded = await TestDataSeeder.SeedBasicUsersAsync(services);
                postId = await TestDataSeeder.SeedPostAsync(services, seeded.ArtistId, "Post for my reports");
            });

        // Create a report
        var createResponse = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Post,
            $"/api/posts/{postId}/reports",
            seeded.OtherId,
            "Artist",
            new { reason = "Harassment", details = "My reports endpoint check" });
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);

        // List my reports
        var listResponse = await IntegrationTestHost.SendAuthenticatedAsync(
            host.Client,
            HttpMethod.Get,
            "/api/reports/me?page=1&pageSize=20",
            seeded.OtherId,
            "Artist");

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

        using var json = JsonDocument.Parse(await listResponse.Content.ReadAsStringAsync());
        Assert.True(json.RootElement.GetProperty("totalCount").GetInt32() >= 1);
    }
}
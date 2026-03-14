namespace Krea.API.Tests.Admin;

using System.Net;
using System.Net.Http.Json;
using Krea.API.Controllers;
using Krea.API.Tests.TestSupport;
using Krea.Application.Features.Admin.Configuration;
using Krea.Application.Features.Admin.Dashboard;
using Krea.Application.Features.Admin.Reports;
using Krea.Application.Features.Admin.Users;
using Krea.Domain.Abstractions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public sealed class AdminControllerHttpTests {
    [Fact]
    public async Task GetDashboard_Admin_ReturnsOk() {
        await using var host = await CreateHostAsync(sender => {
            sender.Register<GetAdminDashboardQuery, AdminDashboardDto>((_, _) =>
                new AdminDashboardDto(10, 5, 2, 0, 1, 1, Array.Empty<AdminActivityLogItemDto>()));
        });

        HttpResponseMessage response = await SendAsAdminAsync(host.Client, HttpMethod.Get, "/api/admin/dashboard");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_InvalidStatus_ReturnsBadRequest() {
        await using var host = await CreateHostAsync(_ => { });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Get,
            "/api/admin/users?status=not-a-status");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_NoAuth_ReturnsUnauthorized() {
        await using var host = await CreateHostAsync(_ => { });

        HttpResponseMessage response = await host.Client.GetAsync("/api/admin/users");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_NonAdminRole_ReturnsForbidden() {
        await using var host = await CreateHostAsync(sender => {
            sender.Register<GetAdminUsersQuery, AdminUsersPageDto>((_, _) =>
                new AdminUsersPageDto(1, 20, 0, 0, false, false, AdminUserSortBy.CreatedAt, AdminSortDirection.Desc, Array.Empty<string>(), Array.Empty<AdminUserListItemDto>()));
        });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/admin/users");
        request.Headers.Add(TestAuthHandler.HeaderName, "user");

        HttpResponseMessage response = await host.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_InvalidStatus_ReturnsBadRequest() {
        await using var host = await CreateHostAsync(_ => { });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/users/{Guid.NewGuid()}/status",
            new { status = "WrongStatus" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_UserNotFound_ReturnsNotFound() {
        Guid targetUserId = Guid.NewGuid();

        await using var host = await CreateHostAsync(sender => {
            sender.RegisterAsync<UpdateAdminUserStatusCommand, Unit>((_, _) =>
                Task.FromException<Unit>(new KeyNotFoundException("User not found.")));
        });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/users/{targetUserId}/status",
            new { status = "Suspended" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetReports_Admin_ReturnsOk() {
        await using var host = await CreateHostAsync(sender => {
            sender.Register<GetAdminReportsOverviewQuery, AdminReportsOverviewDto>((_, _) =>
                new AdminReportsOverviewDto(5, 1, 2, 3, 1, Array.Empty<AdminActivityLogItemDto>()));
        });

        HttpResponseMessage response = await SendAsAdminAsync(host.Client, HttpMethod.Get, "/api/admin/reports");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPostReports_InvalidStatus_ReturnsBadRequest() {
            await using var host = await CreateHostAsync(_ => { });

            HttpResponseMessage response = await SendAsAdminAsync(
                host.Client,
                HttpMethod.Get,
                "/api/admin/reports/posts?status=invalid-status");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EvaluatePostReport_InvalidAction_ReturnsBadRequest() {
        await using var host = await CreateHostAsync(_ => { });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/reports/posts/{Guid.NewGuid()}/evaluate",
            new {
                action = "Nope",
                moderatorNote = "test"
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EvaluatePostReport_ReportNotFound_ReturnsNotFound() {
        await using var host = await CreateHostAsync(sender => {
            sender.RegisterAsync<EvaluateAdminPostModerationReportCommand, Unit>((_, _) =>
                Task.FromException<Unit>(new KeyNotFoundException("Report not found.")));
        });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Patch,
            $"/api/admin/reports/posts/{Guid.NewGuid()}/evaluate",
            new {
                action = "Dismiss",
                moderatorNote = "test"
            });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_UserNotFound_ReturnsNotFound() {
        Guid targetUserId = Guid.NewGuid();

        await using var host = await CreateHostAsync(sender => {
            sender.RegisterAsync<DeleteAdminUserCommand, Unit>((_, _) =>
                Task.FromException<Unit>(new KeyNotFoundException("User not found.")));
        });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Delete,
            $"/api/admin/users/{targetUserId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetConfiguration_Admin_ReturnsOk() {
        await using var host = await CreateHostAsync(sender => {
            sender.Register<GetAdminInstanceConfigurationQuery, AdminInstanceConfigurationDto>((_, _) =>
                new AdminInstanceConfigurationDto("Krea", "Desc", "admin@krea.local"));
        });

        HttpResponseMessage response = await SendAsAdminAsync(host.Client, HttpMethod.Get, "/api/admin/configuration");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UpdateConfiguration_InvalidPayload_ReturnsBadRequest() {
        await using var host = await CreateHostAsync(sender => {
            sender.RegisterAsync<UpdateAdminInstanceConfigurationCommand, AdminInstanceConfigurationDto>((_, _) =>
                Task.FromException<AdminInstanceConfigurationDto>(new ArgumentException("PlatformName is required.")));
        });

        HttpResponseMessage response = await SendAsAdminAsync(
            host.Client,
            HttpMethod.Put,
            "/api/admin/configuration",
            new {
                platformName = "",
                description = "Description",
                administratorEmail = "admin@krea.local"
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static async Task<TestApiHost> CreateHostAsync(Action<FakeSender> configureSender) {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions {
            EnvironmentName = "Testing"
        });

        builder.WebHost.UseTestServer();

        var sender = new FakeSender();
        configureSender(sender);

        builder.Services.AddSingleton<ISender>(sender);
        builder.Services.AddControllers().AddApplicationPart(typeof(AdminController).Assembly);
        builder.Services.AddAuthentication("Test")
               .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        builder.Services.AddAuthorization();

        WebApplication app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        await app.StartAsync();
        HttpClient client = app.GetTestClient();
        return new TestApiHost(app, client);
    }

    private static async Task<HttpResponseMessage> SendAsAdminAsync(
        HttpClient client,
        HttpMethod method,
        string url,
        object? body = null) {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Add(TestAuthHandler.HeaderName, "admin");

        if (body is not null) {
            request.Content = JsonContent.Create(body);
        }

        return await client.SendAsync(request);
    }

    private sealed class TestApiHost : IAsyncDisposable {
        public TestApiHost(WebApplication app, HttpClient client) {
            App = app;
            Client = client;
        }

        public WebApplication App { get; }

        public HttpClient Client { get; }

        public async ValueTask DisposeAsync() {
            Client.Dispose();
            await App.DisposeAsync();
        }
    }
}

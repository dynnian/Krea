namespace Krea.API.Tests.TestSupport {
    using Controllers;
    using Services;
    using Application;
    using Application.Abstractions.Url;
    using Infrastructure;
    using Infrastructure.Data;
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.TestHost;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.DependencyInjection.Extensions;
    using Npgsql;
    using Application.Abstractions.Auth;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Logging;

    public sealed class IntegrationTestHost : IAsyncDisposable {
        private const string DefaultAdminDatabase = "postgres";
        private const string FallbackAdminConnectionString =
            "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=1234";

        private readonly string _adminConnectionString;
        private readonly string _databaseName;

        private IntegrationTestHost(WebApplication app, HttpClient client, string databaseName, string adminConnectionString) {
            App = app;
            Client = client;
            _databaseName = databaseName;
            _adminConnectionString = adminConnectionString;
        }

        public WebApplication App { get; }

        public HttpClient Client { get; }

        public static async Task<IntegrationTestHost> CreateAsync(
            PostgresContainerFixture? postgres = null,
            Action<IServiceCollection>? configureServices = null,
            Func<IServiceProvider, Task>? seed = null,
            string? databaseName = null) {
            string dbName = databaseName ?? $"krea_test_{Guid.NewGuid():N}";
            string adminConnectionString = ResolveAdminConnectionString(postgres);
            await CreateDatabaseAsync(adminConnectionString, dbName);

            WebApplicationBuilder builder = WebApplication.CreateBuilder(new WebApplicationOptions {
                EnvironmentName = "Testing"
            });

            builder.WebHost.UseTestServer();

            var settings = new Dictionary<string, string?> {
                ["ConnectionStrings:DefaultConnection"] = BuildDatabaseConnectionString(adminConnectionString, dbName),
                ["UseFakeEmail"] = "true",
                ["Jwt:Issuer"] = "krea-tests",
                ["Jwt:Audience"] = "krea-tests",
                ["Jwt:Key"] = "a-very-long-test-key-for-jwt-signing-123456789",
                ["Minio:Endpoint"] = "localhost:9000",
                ["Minio:AccessKey"] = "minioadmin",
                ["Minio:SecretKey"] = "minioadmin",
                ["InstanceSettings:PlatformName"] = "Krea Test",
                ["InstanceSettings:Description"] = "Integration tests",
                ["InstanceSettings:AdministratorEmail"] = "admin@test.local"
            };

            builder.Configuration.AddInMemoryCollection(settings);

            builder.Services.AddApplication();
            builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
            builder.Services.RemoveAll<Application.Abstractions.FileStorage.IFileStorage>();
            builder.Services.RemoveAll<Application.Abstractions.IFileMetadataReader>();
            builder.Services.RemoveAll<Application.Abstractions.Files.IFileCoverExtractor>();
            builder.Services.AddScoped<Application.Abstractions.FileStorage.IFileStorage, InMemoryFileStorage>();
            builder.Services.AddScoped<Application.Abstractions.IFileMetadataReader, FakeFileMetadataReader>();
            builder.Services.AddScoped<Application.Abstractions.Files.IFileCoverExtractor, FakeFileCoverExtractor>();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<IConfirmationUrlBuilder, ConfirmationUrlBuilder>();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
            builder.Services.AddControllers().AddApplicationPart(typeof(AdminController).Assembly);
            builder.Services.AddAuthentication(options => {
                       options.DefaultAuthenticateScheme = "Test";
                       options.DefaultChallengeScheme = "Test";
                   })
                   .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
            builder.Services.AddAuthorization();

            configureServices?.Invoke(builder.Services);

            builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);

            WebApplication app = builder.Build();

            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            using (IServiceScope scope = app.Services.CreateScope()) {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await dbContext.Database.MigrateAsync();

                if (seed is not null) {
                    await seed(scope.ServiceProvider);
                }
            }

            await app.StartAsync();

            HttpClient client = app.GetTestClient();
            client.BaseAddress = new Uri("http://localhost");

            return new IntegrationTestHost(app, client, dbName, adminConnectionString);
        }

        public static async Task<HttpResponseMessage> SendAuthenticatedAsync(
            HttpClient client,
            HttpMethod method,
            string url,
            Guid userId,
            string role = "Artist",
            object? body = null) {
            using HttpRequestMessage request = CreateAuthenticatedRequest(method, url, userId, role);

            if (body is not null) {
                request.Content = System.Net.Http.Json.JsonContent.Create(body);
            }

            return await client.SendAsync(request);
        }

        public static HttpRequestMessage CreateAuthenticatedRequest(
            HttpMethod method,
            string url,
            Guid userId,
            string role = "Artist",
            HttpContent? content = null) {
            var request = new HttpRequestMessage(method, url);
            request.Headers.Add(TestAuthHandler.HeaderName,
                role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? "admin" : "user");
            request.Headers.Add(TestAuthHandler.UserIdHeaderName, userId.ToString());
            request.Content = content;

            return request;
        }

        public async ValueTask DisposeAsync() {
            Client.Dispose();
            await App.DisposeAsync();
            await DropDatabaseAsync(_adminConnectionString, _databaseName);
        }

        private static string ResolveAdminConnectionString(PostgresContainerFixture? postgres) {
            if (postgres is not null && !string.IsNullOrWhiteSpace(postgres.AdminConnectionString)) {
                return postgres.AdminConnectionString;
            }

            string? fromEnvironment = Environment.GetEnvironmentVariable("KREA_TEST_ADMIN_CONNECTION_STRING");
            return string.IsNullOrWhiteSpace(fromEnvironment) ? FallbackAdminConnectionString : fromEnvironment;
        }

        private static string BuildDatabaseConnectionString(string adminConnectionString, string databaseName) {
            var builder = new NpgsqlConnectionStringBuilder(adminConnectionString) {
                Database = databaseName
            };

            return builder.ConnectionString;
        }

        private static async Task CreateDatabaseAsync(string adminConnectionString, string databaseName) {
            string masterConnectionString = BuildDatabaseConnectionString(adminConnectionString, DefaultAdminDatabase);

            await using var connection = new NpgsqlConnection(masterConnectionString);
            await connection.OpenAsync();

            await using NpgsqlCommand command = connection.CreateCommand();
            command.CommandText = $"CREATE DATABASE \"{databaseName}\";";
            await command.ExecuteNonQueryAsync();
        }

        private static async Task DropDatabaseAsync(string adminConnectionString, string databaseName) {
            string masterConnectionString = BuildDatabaseConnectionString(adminConnectionString, DefaultAdminDatabase);

            await using var connection = new NpgsqlConnection(masterConnectionString);
            await connection.OpenAsync();

            await using NpgsqlCommand terminateCommand = connection.CreateCommand();
            terminateCommand.CommandText =
                $"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{databaseName}' AND pid <> pg_backend_pid();";
            await terminateCommand.ExecuteNonQueryAsync();

            await using NpgsqlCommand dropCommand = connection.CreateCommand();
            dropCommand.CommandText = $"DROP DATABASE IF EXISTS \"{databaseName}\";";
            await dropCommand.ExecuteNonQueryAsync();
        }
    }
}
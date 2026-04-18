namespace Krea.API.Tests.TestSupport;

using Testcontainers.PostgreSql;
using Xunit;

public sealed class PostgresContainerFixture : IAsyncLifetime {
    private PostgreSqlContainer? _container;

    public string AdminConnectionString { get; private set; } = string.Empty;

    public async Task InitializeAsync() {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("postgres")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();

        await _container.StartAsync();
        AdminConnectionString = _container.GetConnectionString();
    }

    public async Task DisposeAsync() {
        if (_container is null) {
            return;
        }

        await _container.DisposeAsync();
    }
}

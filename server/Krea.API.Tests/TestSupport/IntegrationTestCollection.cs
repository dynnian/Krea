namespace Krea.API.Tests.TestSupport;

using Xunit;

[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class IntegrationTestCollection : ICollectionFixture<PostgresContainerFixture> {
    public const string Name = "IntegrationTests";
}

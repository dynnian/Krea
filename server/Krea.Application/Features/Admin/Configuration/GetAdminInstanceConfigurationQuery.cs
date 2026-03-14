namespace Krea.Application.Features.Admin.Configuration {
    using Domain.Abstractions;

    public sealed record GetAdminInstanceConfigurationQuery() : IRequest<AdminInstanceConfigurationDto>;
}

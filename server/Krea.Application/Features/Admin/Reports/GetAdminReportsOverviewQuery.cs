namespace Krea.Application.Features.Admin.Reports {
    using Domain.Abstractions;

    public sealed record GetAdminReportsOverviewQuery() : IRequest<AdminReportsOverviewDto>;
}
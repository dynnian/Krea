namespace Krea.Application.Features.Admin.Dashboard {
    using Domain.Abstractions;

    public sealed record GetAdminDashboardQuery() : IRequest<AdminDashboardDto>;
}

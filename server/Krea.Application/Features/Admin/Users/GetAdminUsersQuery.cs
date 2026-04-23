namespace Krea.Application.Features.Admin.Users {
    using Domain.Abstractions;

    public sealed record GetAdminUsersQuery(
        string? Search,
        string? Role,
        AdminUserStatus? Status,
        int Page,
        int PageSize,
        AdminUserSortBy SortBy,
        AdminSortDirection SortDirection
    ) : IRequest<AdminUsersPageDto>;
}
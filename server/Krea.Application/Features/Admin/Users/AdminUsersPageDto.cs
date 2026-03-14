namespace Krea.Application.Features.Admin.Users {
    public sealed record AdminUsersPageDto(
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages,
        bool HasPrevious,
        bool HasNext,
        AdminUserSortBy SortBy,
        AdminSortDirection SortDirection,
        IReadOnlyList<string> AvailableRoles,
        IReadOnlyList<AdminUserListItemDto> Items
    );
}

namespace Krea.Application.Features.Admin.Users {
    public sealed record AdminUserListItemDto(
        Guid Id,
        string Username,
        string Email,
        string DisplayName,
        string Role,
        AdminUserStatus Status,
        DateTime CreatedAt
    );
}
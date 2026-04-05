namespace Krea.Application.Features.User {
    public sealed record UserSearchItemDto(
        Guid Id,
        string Username,
        string DisplayName,
        string? Biography,
        string? ProfilePictureUrl);
}
namespace Krea.Application.Features.Follows {
    public sealed record FollowUserItemDto(
        Guid Id,
        string Username,
        string DisplayName,
        string? Biography,
        string? ProfilePictureUrl,
        bool IsFollowing
    );
}
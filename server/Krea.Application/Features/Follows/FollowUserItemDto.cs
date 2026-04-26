namespace Krea.Application.Features.Follows {
    public sealed record FollowUserItemDto(
        Guid Id,
        string UserName,
        string DisplayName,
        string? Biography,
        string? ProfilePictureUrl,
        bool IsFollowedByCurrentUser
    );
}
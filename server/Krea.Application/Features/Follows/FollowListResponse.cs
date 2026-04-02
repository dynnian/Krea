namespace Krea.Application.Features.Follows {
    public sealed record FollowListResponse(
        IReadOnlyList<FollowUserItemDto> Users,
        int Page,
        int PageSize,
        int TotalCount
    );
}
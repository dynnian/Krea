namespace Krea.Application.Features.Follows {
    using Domain.Abstractions;

    public sealed record GetFollowersQuery(
        Guid TargetUserId,
        Guid? CurrentUserId,
        int Page,
        int PageSize
    ) : IRequest<FollowListResponse>;
}
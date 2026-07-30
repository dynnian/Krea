namespace Krea.Application.Features.Follows {
    using Domain.Abstractions;

    public sealed record GetFollowingUsersQuery(
        Guid TargetUserId,
        Guid? CurrentUserId,
        int Page,
        int PageSize
    ) : IRequest<FollowListResponse>;
}
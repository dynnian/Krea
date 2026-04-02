namespace Krea.Application.Features.Follows {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetFollowingUsersQueryHandler
        : IRequestHandler<GetFollowingUsersQuery, FollowListResponse> {
        private readonly IFollowRepository _followRepository;
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;

        public GetFollowingUsersQueryHandler(
            IFollowRepository followRepository,
            IUserRepository userRepository,
            IIdentityService identityService) {
            _followRepository = followRepository;
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<FollowListResponse> Handle(
            GetFollowingUsersQuery request,
            CancellationToken cancellationToken) {
            if (request.Page <= 0)
                throw new ArgumentOutOfRangeException(nameof(request.Page));

            if (request.PageSize <= 0 || request.PageSize > 100)
                throw new ArgumentOutOfRangeException(nameof(request.PageSize));

            Domain.Entities.User? targetUser = await _userRepository
                .GetByIdAsync(request.TargetUserId, cancellationToken);

            if (targetUser is null)
                return new FollowListResponse(
                    Array.Empty<FollowUserItemDto>(),
                    request.Page,
                    request.PageSize,
                    0);

            IReadOnlyList<Follow> following = await _followRepository.GetFollowingPageAsync(
                request.TargetUserId,
                request.Page,
                request.PageSize,
                cancellationToken);

            int totalCount = await _followRepository.GetFollowingCountAsync(
                request.TargetUserId,
                cancellationToken);

            IReadOnlyList<Guid> followedUserIds = following
                .Select(f => f.Target.Id)
                .Distinct()
                .ToList();

            IReadOnlyDictionary<Guid, UserIdentity> identityMap =
                await _identityService.GetByIdsAsync(followedUserIds);

            HashSet<Guid> followedIdsByCurrentUser = request.CurrentUserId.HasValue
                ? await _followRepository.GetFollowedTargetIdsAsync(
                    request.CurrentUserId.Value,
                    followedUserIds,
                    cancellationToken)
                : new HashSet<Guid>();

            var result = following
                .Select(follow => {
                    Domain.Entities.User followedUser = follow.Target;
                    identityMap.TryGetValue(followedUser.Id, out UserIdentity? identityUser);

                    return new FollowUserItemDto(
                        followedUser.Id,
                        identityUser?.UserName ?? string.Empty,
                        followedUser.DisplayName,
                        followedUser.Biography,
                        followedUser.ProfilePicture?.Path,
                        followedIdsByCurrentUser.Contains(followedUser.Id)
                    );
                })
                .ToList();

            return new FollowListResponse(
                result,
                request.Page,
                request.PageSize,
                totalCount
            );
        }
    }
}
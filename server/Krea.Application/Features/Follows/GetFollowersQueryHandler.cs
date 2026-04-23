namespace Krea.Application.Features.Follows {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetFollowersQueryHandler
        : IRequestHandler<GetFollowersQuery, FollowListResponse> {
        private readonly IFollowRepository _followRepository;
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;

        public GetFollowersQueryHandler(
            IFollowRepository followRepository,
            IUserRepository userRepository,
            IIdentityService identityService) {
            _followRepository = followRepository;
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<FollowListResponse> Handle(
            GetFollowersQuery request,
            CancellationToken cancellationToken) {
            if (request.Page <= 0)
                throw new ArgumentOutOfRangeException(nameof(request.Page));

            if (request.PageSize <= 0 || request.PageSize > 100)
                throw new ArgumentOutOfRangeException(nameof(request.PageSize));

            User? targetUser = await _userRepository
                .GetByIdAsync(request.TargetUserId, cancellationToken);

            if (targetUser is null) {
                return new FollowListResponse(
                    Array.Empty<FollowUserItemDto>(),
                    request.Page,
                    request.PageSize,
                    0);
            }

            IReadOnlyList<Follow> followers = await _followRepository.GetFollowersPageAsync(
                request.TargetUserId,
                request.Page,
                request.PageSize,
                cancellationToken);

            int totalCount = await _followRepository.GetFollowersCountAsync(
                request.TargetUserId,
                cancellationToken);

            IReadOnlyList<Guid> followerIds = followers
                                              .Select(f => f.Source.Id)
                                              .Distinct()
                                              .ToList();

            IReadOnlyDictionary<Guid, UserIdentity> identityMap =
                await _identityService.GetByIdsAsync(followerIds);

            HashSet<Guid> followedIds = request.CurrentUserId.HasValue
                ? await _followRepository.GetFollowedTargetIdsAsync(
                    request.CurrentUserId.Value,
                    followerIds,
                    cancellationToken)
                : new HashSet<Guid>();

            List<FollowUserItemDto> result = followers
                                             .Select(follow => {
                                                 User followerUser = follow.Source;
                                                 identityMap.TryGetValue(followerUser.Id,
                                                     out UserIdentity? identityUser);

                                                 return new FollowUserItemDto(
                                                     followerUser.Id,
                                                     identityUser?.UserName ?? string.Empty,
                                                     followerUser.DisplayName,
                                                     followerUser.Biography,
                                                     followerUser.ProfilePicture?.Path,
                                                     followedIds.Contains(followerUser.Id)
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
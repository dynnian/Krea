namespace Krea.Application.Features.User {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class GetPublicUserProfileQueryHandler
        : IRequestHandler<GetPublicUserProfileQuery, PublicUserProfileResponse?> {
        private readonly IUserRepository _userRepository;
        private readonly IFollowRepository _followRepository;
        private readonly IIdentityService _identityService;

        public GetPublicUserProfileQueryHandler(
            IUserRepository userRepository,
            IFollowRepository followRepository,
            IIdentityService identityService) {
            _userRepository = userRepository;
            _followRepository = followRepository;
            _identityService = identityService;
        }

        public async Task<PublicUserProfileResponse?> Handle(
            GetPublicUserProfileQuery request,
            CancellationToken cancellationToken) {
            Domain.Entities.User? domainUser = await _userRepository
                .GetByIdWithPicturesAsync(request.UserId, cancellationToken);

            if (domainUser is null)
                return null;

            UserIdentity? identityUser = await _identityService.FindByIdAsync(request.UserId);

            if (identityUser is null)
                return null;

            int followersCount = await _followRepository
                .GetFollowersCountAsync(request.UserId, cancellationToken);

            int followingCount = await _followRepository
                .GetFollowingCountAsync(request.UserId, cancellationToken);

            bool isFollowedByCurrentUser = false;

            if (request.CurrentUserId.HasValue &&
                request.CurrentUserId.Value != request.UserId) {
                HashSet<Guid> followedIds = await _followRepository.GetFollowedTargetIdsAsync(
                    request.CurrentUserId.Value,
                    new[] { request.UserId },
                    cancellationToken);

                isFollowedByCurrentUser = followedIds.Contains(request.UserId);
            }

            return new PublicUserProfileResponse(
                domainUser.Id,
                identityUser.UserName!,
                domainUser.DisplayName,
                domainUser.Biography,
                domainUser.LanguageCode,
                domainUser.TimeZoneId,
                followersCount,
                followingCount,
                domainUser.ProfilePicture?.Path,
                isFollowedByCurrentUser
            );
        }
    }
}
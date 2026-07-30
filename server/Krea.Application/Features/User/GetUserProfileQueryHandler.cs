namespace Krea.Application.Features.User {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Repositories;
    using static Common.RoleHelper;

    public sealed class GetUserProfileQueryHandler
        : IRequestHandler<GetUserProfileQuery, UserProfileDto?> {
        private readonly IUserRepository _userRepository;
        private readonly IFollowRepository _followRepository;
        private readonly IIdentityService _identityService;

        public GetUserProfileQueryHandler(
            IUserRepository userRepository,
            IFollowRepository followRepository,
            IIdentityService identityService) {
            _userRepository = userRepository;
            _followRepository = followRepository;
            _identityService = identityService;
        }

        public async Task<UserProfileDto?> Handle(
            GetUserProfileQuery request,
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

            return new UserProfileDto(
                domainUser.Id,
                identityUser.UserName,
                identityUser.Email,
                domainUser.DisplayName,
                domainUser.Biography,
                domainUser.LanguageCode,
                domainUser.TimeZoneId,
                GetRoleInt(identityUser.Roles),
                followersCount,
                followingCount,
                domainUser.ProfilePicture?.Path,
                domainUser.BannerPicture?.Path
            );
        }
    }
}
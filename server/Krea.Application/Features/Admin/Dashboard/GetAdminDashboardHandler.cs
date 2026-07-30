namespace Krea.Application.Features.Admin.Dashboard {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetAdminDashboardHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto> {
        private readonly IUserRepository _userRepository;
        private readonly IPostRepository _postRepository;
        private readonly IFollowRepository _followRepository;
        private readonly IIdentityService _identityService;

        public GetAdminDashboardHandler(
            IUserRepository userRepository,
            IPostRepository postRepository,
            IFollowRepository followRepository,
            IIdentityService identityService) {
            _userRepository = userRepository;
            _postRepository = postRepository;
            _followRepository = followRepository;
            _identityService = identityService;
        }

        public async Task<AdminDashboardDto>
            Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken) {
            DateTime todayUtc = DateTime.UtcNow.Date;

            int totalUsers = await _userRepository.CountAsync(cancellationToken);
            int activeToday = await _userRepository.CountActiveSinceAsync(todayUtc, cancellationToken);
            int suspendedUsers = await _userRepository.CountSuspendedAsync(cancellationToken);
            int bannedUsers = await _userRepository.CountBannedAsync(cancellationToken);
            int federationInteractions = await _followRepository.CountAsync(cancellationToken);

            IReadOnlyList<User> recentUsers = await _userRepository.GetRecentlyRegisteredAsync(8, cancellationToken);
            IReadOnlyList<Post> recentPosts = await _postRepository.GetRecentAsync(8, cancellationToken);
            IReadOnlyList<Follow> recentFollows = await _followRepository.GetRecentAsync(8, cancellationToken);

            IReadOnlyDictionary<Guid, UserIdentity> identitiesById = await _identityService.GetByIdsAsync(
                recentUsers.Select(u => u.Id)
                           .Concat(recentPosts.Select(p => p.AuthorPostId))
                           .Concat(recentFollows.Select(f => f.SourceId))
                           .Concat(recentFollows.Select(f => f.TargetId))
                           .Distinct()
                           .ToList());

            var activity = new List<AdminActivityLogItemDto>();

            activity.AddRange(recentUsers.Select(u => new AdminActivityLogItemDto(
                "Actividad de Usuario",
                "Registro de Usuario",
                identitiesById.TryGetValue(u.Id, out UserIdentity? identity) ? identity.UserName : u.DisplayName,
                "Nueva cuenta de usuario creada",
                u.RegisteredAt,
                "Exito")));

            activity.AddRange(recentPosts.Select(p => new AdminActivityLogItemDto(
                "Actividad de Usuario",
                "Publicacion Creada",
                identitiesById.TryGetValue(p.AuthorPostId, out UserIdentity? identity)
                    ? identity.UserName
                    : p.AuthorPostId.ToString(),
                string.IsNullOrWhiteSpace(p.Title) ? "Nueva publicacion" : p.Title,
                p.UploadedAt,
                "Info")));

            activity.AddRange(recentFollows.Select(f => {
                string source = identitiesById.TryGetValue(f.SourceId, out UserIdentity? sourceIdentity)
                    ? sourceIdentity.UserName
                    : f.SourceId.ToString();

                string target = identitiesById.TryGetValue(f.TargetId, out UserIdentity? targetIdentity)
                    ? targetIdentity.UserName
                    : f.TargetId.ToString();

                return new AdminActivityLogItemDto(
                    "Federacion",
                    "Interaccion de Seguimiento",
                    source,
                    $"{source} empezo a seguir a {target}",
                    f.FollowedAt,
                    "Info");
            }));

            IReadOnlyList<AdminActivityLogItemDto> recentActivity = activity
                                                                    .OrderByDescending(a => a.OccurredAt)
                                                                    .Take(15)
                                                                    .ToList();

            int moderationActions = suspendedUsers + bannedUsers;

            return new AdminDashboardDto(
                totalUsers,
                activeToday,
                federationInteractions,
                0,
                suspendedUsers,
                moderationActions,
                recentActivity);
        }
    }
}
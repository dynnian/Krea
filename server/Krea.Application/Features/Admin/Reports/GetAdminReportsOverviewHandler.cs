namespace Krea.Application.Features.Admin.Reports {
    using Dashboard;
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class
        GetAdminReportsOverviewHandler : IRequestHandler<GetAdminReportsOverviewQuery, AdminReportsOverviewDto> {
        private readonly IUserRepository _userRepository;
        private readonly IPostRepository _postRepository;
        private readonly IFollowRepository _followRepository;
        private readonly IIdentityService _identityService;

        public GetAdminReportsOverviewHandler(
            IUserRepository userRepository,
            IPostRepository postRepository,
            IFollowRepository followRepository,
            IIdentityService identityService) {
            _userRepository = userRepository;
            _postRepository = postRepository;
            _followRepository = followRepository;
            _identityService = identityService;
        }

        public async Task<AdminReportsOverviewDto> Handle(
            GetAdminReportsOverviewQuery request,
            CancellationToken cancellationToken) {
            int totalUsers = await _userRepository.CountAsync(cancellationToken);
            int suspendedUsers = await _userRepository.CountSuspendedAsync(cancellationToken);
            int totalPublications = await _postRepository.CountAsync(cancellationToken);
            int federationInteractions = await _followRepository.CountAsync(cancellationToken);
            int moderationActions = suspendedUsers + await _userRepository.CountBannedAsync(cancellationToken);

            IReadOnlyList<User> recentUsers = await _userRepository.GetRecentlyRegisteredAsync(10, cancellationToken);
            IReadOnlyList<Post> recentPosts = await _postRepository.GetRecentAsync(10, cancellationToken);
            IReadOnlyList<Follow> recentFollows = await _followRepository.GetRecentAsync(10, cancellationToken);

            IReadOnlyDictionary<Guid, UserIdentity> identitiesById = await _identityService.GetByIdsAsync(
                recentUsers.Select(u => u.Id)
                           .Concat(recentPosts.Select(p => p.AuthorPostId))
                           .Concat(recentFollows.Select(f => f.SourceId))
                           .Distinct()
                           .ToList());

            var activity = new List<AdminActivityLogItemDto>();

            activity.AddRange(recentUsers.Select(u => new AdminActivityLogItemDto(
                "Actividad de Usuario",
                u.IsDisabled || u.IsBanned ? "Cuenta Restringida" : "Registro de Usuario",
                identitiesById.TryGetValue(u.Id, out UserIdentity? identity) ? identity.UserName : u.DisplayName,
                u.IsDisabled || u.IsBanned ? "Cuenta en estado de restriccion" : "Nueva cuenta de usuario creada",
                u.RegisteredAt,
                u.IsDisabled || u.IsBanned ? "Advertencia" : "Exito")));

            activity.AddRange(recentPosts.Select(p => new AdminActivityLogItemDto(
                "Moderacion",
                "Contenido Publicado",
                identitiesById.TryGetValue(p.AuthorPostId, out UserIdentity? identity)
                    ? identity.UserName
                    : p.AuthorPostId.ToString(),
                string.IsNullOrWhiteSpace(p.Title) ? "Publicacion creada" : p.Title,
                p.UploadedAt,
                "Info")));

            activity.AddRange(recentFollows.Select(f => {
                string source = identitiesById.TryGetValue(f.SourceId, out UserIdentity? sourceIdentity)
                    ? sourceIdentity.UserName
                    : f.SourceId.ToString();

                return new AdminActivityLogItemDto(
                    "Federacion",
                    "Publicacion Entrante",
                    source,
                    "Interaccion de seguimiento registrada",
                    f.FollowedAt,
                    "Info");
            }));

            IReadOnlyList<AdminActivityLogItemDto> orderedActivity = activity
                                                                     .OrderByDescending(a => a.OccurredAt)
                                                                     .Take(25)
                                                                     .ToList();

            return new AdminReportsOverviewDto(
                Math.Max(0, totalUsers - suspendedUsers),
                suspendedUsers,
                totalPublications,
                federationInteractions,
                moderationActions,
                orderedActivity);
        }
    }
}
namespace Krea.Application.Features.Admin.Users {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class GetAdminUsersHandler : IRequestHandler<GetAdminUsersQuery, AdminUsersPageDto> {
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;

        public GetAdminUsersHandler(IUserRepository userRepository, IIdentityService identityService) {
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<AdminUsersPageDto> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken) {
            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize is <= 0 or > 200 ? 20 : request.PageSize;

            IReadOnlyList<UserIdentity> identities = await _identityService.SearchUsersAsync(
                request.Search,
                request.Role,
                cancellationToken);

            Dictionary<Guid, UserIdentity> identityByUserId = identities.ToDictionary(i => i.Id, i => i);
            IReadOnlyList<User> users =
                await _userRepository.GetByIdsAsync(identityByUserId.Keys.ToList(), cancellationToken);

            List<(User DomainUser, UserIdentity Identity)> merged = users
                                                                    .Where(u => identityByUserId.ContainsKey(u.Id))
                                                                    .Select(u => (u, identityByUserId[u.Id]))
                                                                    .ToList();

            if (request.Status.HasValue) {
                merged = merged.Where(x => AdminUserStatusResolver.Resolve(x.DomainUser) == request.Status.Value)
                               .ToList();
            }

            merged = ApplySorting(merged, request.SortBy, request.SortDirection);

            int totalCount = merged.Count;
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            List<AdminUserListItemDto> items = merged
                                               .Skip((page - 1) * pageSize)
                                               .Take(pageSize)
                                               .Select(x => new AdminUserListItemDto(
                                                   x.DomainUser.Id,
                                                   x.Identity.UserName,
                                                   x.Identity.Email,
                                                   x.DomainUser.DisplayName,
                                                   x.Identity.Roles.FirstOrDefault() ?? "Artist",
                                                   AdminUserStatusResolver.Resolve(x.DomainUser),
                                                   x.DomainUser.RegisteredAt))
                                               .ToList();

            IReadOnlyList<string> availableRoles = await _identityService.GetAvailableRolesAsync();

            return new AdminUsersPageDto(
                page,
                pageSize,
                totalCount,
                totalPages,
                page > 1,
                totalPages > page,
                request.SortBy,
                request.SortDirection,
                availableRoles,
                items);
        }

        private static List<(User DomainUser, UserIdentity Identity)> ApplySorting(
            IEnumerable<(User DomainUser, UserIdentity Identity)> source,
            AdminUserSortBy sortBy,
            AdminSortDirection sortDirection) {
            Func<(User DomainUser, UserIdentity Identity), object> keySelector = sortBy switch {
                AdminUserSortBy.Username => item => item.Identity.UserName,
                AdminUserSortBy.Email => item => item.Identity.Email,
                AdminUserSortBy.DisplayName => item => item.DomainUser.DisplayName,
                AdminUserSortBy.Role => item => item.Identity.Roles.FirstOrDefault() ?? "Artist",
                AdminUserSortBy.Status => item => (int)AdminUserStatusResolver.Resolve(item.DomainUser),
                _ => item => item.DomainUser.RegisteredAt
            };

            return sortDirection == AdminSortDirection.Asc
                ? source.OrderBy(keySelector).ToList()
                : source.OrderByDescending(keySelector).ToList();
        }
    }
}
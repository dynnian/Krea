namespace Krea.Application.Features.User.SearchUser {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class SearchUsersHandler
        : IRequestHandler<SearchUsersQuery, PaginatedList<UserSearchItemDto>> {
        private readonly IUserRepository _userRepository;
        private readonly IIdentityService _identityService;

        public SearchUsersHandler(
            IUserRepository userRepository,
            IIdentityService identityService) {
            _userRepository = userRepository;
            _identityService = identityService;
        }

        public async Task<PaginatedList<UserSearchItemDto>> Handle(
            SearchUsersQuery request,
            CancellationToken cancellationToken) {
            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 20 : request.PageSize;

            if (string.IsNullOrWhiteSpace(request.Query)) {
                return PaginatedList<UserSearchItemDto>.FromItems(
                    Array.Empty<UserSearchItemDto>(),
                    0,
                    page,
                    pageSize);
            }

            string query = request.Query.Trim();

            IReadOnlyList<UserIdentity> identityMatches =
                await _identityService.SearchUsersAsync(query, null, cancellationToken);

            IReadOnlyList<User> displayNameMatches =
                await _userRepository.SearchByDisplayNameAsync(query, cancellationToken);

            HashSet<Guid> allIds = identityMatches
                .Select(x => x.Id)
                .Concat(displayNameMatches.Select(x => x.Id))
                .ToHashSet();

            if (request.CurrentUserId.HasValue)
                allIds.Remove(request.CurrentUserId.Value);

            if (allIds.Count == 0) {
                return PaginatedList<UserSearchItemDto>.FromItems(
                    Array.Empty<UserSearchItemDto>(),
                    0,
                    page,
                    pageSize);
            }

            IReadOnlyList<User> users = await _userRepository.GetByIdsAsync(
                allIds.ToArray(),
                cancellationToken);

            IReadOnlyDictionary<Guid, UserIdentity> identities =
                await _identityService.GetByIdsAsync(allIds.ToArray());

            IReadOnlyList<UserSearchItemDto> orderedResults = users
                .Where(u => !u.IsBanned && !u.IsDisabled)
                .Where(u => identities.ContainsKey(u.Id))
                .Select(u => {
                    UserIdentity identity = identities[u.Id];

                    return new {
                        User = u,
                        Identity = identity,
                        Dto = new UserSearchItemDto(
                            u.Id,
                            identity.UserName,
                            u.DisplayName,
                            u.Biography,
                            u.ProfilePicture?.Path)
                    };
                })
                .OrderBy(x => string.Equals(
                    x.Identity.UserName,
                    query,
                    StringComparison.OrdinalIgnoreCase)
                    ? 0
                    : 1)
                .ThenBy(x => x.Identity.UserName.StartsWith(
                    query,
                    StringComparison.OrdinalIgnoreCase)
                    ? 0
                    : 1)
                .ThenBy(x => string.Equals(
                    x.User.DisplayName,
                    query,
                    StringComparison.OrdinalIgnoreCase)
                    ? 0
                    : 1)
                .ThenBy(x => x.User.DisplayName.StartsWith(
                    query,
                    StringComparison.OrdinalIgnoreCase)
                    ? 0
                    : 1)
                .ThenBy(x => x.User.DisplayName.Contains(
                    query,
                    StringComparison.OrdinalIgnoreCase)
                    ? 0
                    : 1)
                .ThenBy(x => x.User.DisplayName)
                .ThenBy(x => x.Identity.UserName)
                .Select(x => x.Dto)
                .ToList();

            int totalCount = orderedResults.Count;

            IReadOnlyList<UserSearchItemDto> pagedItems = orderedResults
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return PaginatedList<UserSearchItemDto>.FromItems(
                pagedItems,
                totalCount,
                page,
                pageSize);
        }
    }
}
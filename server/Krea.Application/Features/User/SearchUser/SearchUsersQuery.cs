namespace Krea.Application.Features.User.SearchUser {
    using Domain.Abstractions;

    public sealed record SearchUsersQuery(
        string Query,
        int Page = 1,
        int PageSize = 20,
        Guid? CurrentUserId = null
    ) : IRequest<PaginatedList<UserSearchItemDto>>;
}
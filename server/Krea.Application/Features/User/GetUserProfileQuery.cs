namespace Krea.Application.Features.User {
    using Domain.Abstractions;

    public sealed record GetUserProfileQuery(Guid UserId) 
        : IRequest<UserProfileDto?>;
}

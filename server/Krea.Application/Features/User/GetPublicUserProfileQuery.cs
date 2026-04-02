namespace Krea.Application.Features.User {
    using Domain.Abstractions;

    public sealed record GetPublicUserProfileQuery(Guid UserId)
        : IRequest<PublicUserProfileResponse?>;
}
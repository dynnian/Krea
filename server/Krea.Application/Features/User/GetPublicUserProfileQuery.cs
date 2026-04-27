namespace Krea.Application.Features.User {
    using Domain.Abstractions;

    public sealed record GetPublicUserProfileQuery(
        Guid UserId,
        Guid? CurrentUserId = null
    ) : IRequest<PublicUserProfileResponse?>;
}
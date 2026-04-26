namespace Krea.Application.Features.Commissions.RequestChanges {
    using Domain.Abstractions;

    public record RequestChangesCommand(Guid RequestId) : IRequest<Unit>;
}
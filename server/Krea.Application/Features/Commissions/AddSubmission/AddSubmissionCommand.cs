namespace Krea.Application.Features.Commissions.AddSubmission {
    using Domain.Abstractions;

    public record AddSubmissionCommand(Guid RequestId, Guid MediaId) : IRequest<Unit>;
}
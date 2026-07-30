namespace Krea.Application.Features.Commissions.AddSubmissionFeedback {
    using Domain.Abstractions;

    public record AddSubmissionFeedbackCommand(Guid SubmissionId, string Content) : IRequest<Unit>;

    public record AddFeedbackRequest(string Content);
}
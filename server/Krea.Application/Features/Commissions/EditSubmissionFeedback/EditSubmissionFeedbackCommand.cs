namespace Krea.Application.Features.Commissions.EditSubmissionFeedback {
    using Domain.Abstractions;

    public record EditSubmissionFeedbackCommand(Guid FeedbackId, string NewContent) : IRequest<Unit>;
    
    public record EditFeedbackRequest(string NewContent);
}
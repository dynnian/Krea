namespace Krea.Application.Features.Commissions.EditSubmissionFeedback {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Logging;

    public class EditSubmissionFeedbackCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IUnitOfWork unitOfWork,
        ILogger<EditSubmissionFeedbackCommandHandler> logger)
        : IRequestHandler<EditSubmissionFeedbackCommand, Unit>
    {
        public async Task<Unit> Handle(EditSubmissionFeedbackCommand request, CancellationToken cancellationToken)
        {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionRequest? commissionRequest = await requestRepository.GetByFeedbackIdAsync(request.FeedbackId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Find the submission containing the feedback
            Submission? submission = commissionRequest.Submissions.FirstOrDefault(s => s.Feedback.Any(f => f.Id == request.FeedbackId));
            if (submission == null)
                throw new Exception("Submission not found.");

            SubmissionFeedback? feedback = submission.Feedback.FirstOrDefault(f => f.Id == request.FeedbackId);
            if (feedback == null)
                throw new Exception("Feedback not found.");

            if (feedback.AuthorId != currentUserId)
                throw new UnauthorizedAccessException("Only the author can edit this feedback.");

            feedback.Edit(request.NewContent);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Feedback {FeedbackId} edited by user {UserId}", request.FeedbackId, currentUserId);
            return Unit.Value;
        }
    }
}
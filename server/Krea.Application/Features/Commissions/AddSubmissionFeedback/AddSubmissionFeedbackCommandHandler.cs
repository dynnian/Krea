namespace Krea.Application.Features.Commissions.AddSubmissionFeedback {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Logging;

    public class AddSubmissionFeedbackCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ILogger<AddSubmissionFeedbackCommandHandler> logger)
        : IRequestHandler<AddSubmissionFeedbackCommand, Unit> {
        public async Task<Unit> Handle(AddSubmissionFeedbackCommand request, CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            // Load commission request containing the submission
            CommissionRequest? commissionRequest =
                await requestRepository.GetBySubmissionIdAsync(request.SubmissionId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            Submission? submission = commissionRequest.Submissions.FirstOrDefault(s => s.Id == request.SubmissionId);
            if (submission == null)
                throw new Exception("Submission not found.");

            // Only the bidder or artist can add feedback
            bool isBidder = commissionRequest.Bidder.Id == currentUserId;
            bool isArtist = commissionRequest.Offering.Artist.Id == currentUserId;
            if (!isBidder && !isArtist)
                throw new UnauthorizedAccessException("Only the bidder or artist can add feedback.");

            User? author = await userRepository.GetByIdAsync(currentUserId, cancellationToken);
            if (author == null)
                throw new Exception("User not found.");

            submission.AddFeedback(author, request.Content);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Feedback added to submission {SubmissionId} by user {UserId}", request.SubmissionId,
                currentUserId);
            return Unit.Value;
        }
    }
}
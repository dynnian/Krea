namespace Krea.Application.Features.Commissions.AddSubmission {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.Extensions.Logging;

    public class AddSubmissionCommandHandler(
        ICurrentUserService currentUserService,
        ICommissionRequestRepository requestRepository,
        IMediaRepository mediaRepository,
        IUnitOfWork unitOfWork,
        ILogger<AddSubmissionCommandHandler> logger)
        : IRequestHandler<AddSubmissionCommand, Unit> {
        public async Task<Unit> Handle(
            AddSubmissionCommand request,
            CancellationToken cancellationToken) {
            Guid currentUserId = currentUserService.UserId;
            if (currentUserId == Guid.Empty)
                throw new UnauthorizedAccessException();

            CommissionRequest? commissionRequest =
                await requestRepository.GetByIdWithOfferingForUpdateAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            // Only the artist can add submissions
            if (commissionRequest.Offering.Artist.Id != currentUserId)
                throw new UnauthorizedAccessException("Only the artist can add submissions.");

            Media? media = await mediaRepository.GetByIdAsync(request.MediaId, cancellationToken);
            if (media == null)
                throw new Exception("Media not found.");

            // Future Implementation: ensure media belongs to the artist

            commissionRequest.AddSubmission(media);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Submission added to commission request {RequestId} by artist {ArtistId}",
                request.RequestId, currentUserId);

            return Unit.Value;
        }
    }
}
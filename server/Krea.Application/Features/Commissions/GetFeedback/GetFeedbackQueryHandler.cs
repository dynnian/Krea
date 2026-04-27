namespace Krea.Application.Features.Commissions.GetFeedback {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dtos;
    using Microsoft.Extensions.Logging;

    public class GetFeedbackQueryHandler(
        ICommissionRequestRepository requestRepository)
        : IRequestHandler<GetFeedbackQuery, IReadOnlyList<SubmissionFeedbackDto>> {
        public async Task<IReadOnlyList<SubmissionFeedbackDto>> Handle(GetFeedbackQuery request,
                                                                       CancellationToken cancellationToken) {
            CommissionRequest? commissionRequest =
                await requestRepository.GetBySubmissionIdAsync(request.SubmissionId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Submission not found.");

            Submission? submission = commissionRequest.Submissions.FirstOrDefault(s => s.Id == request.SubmissionId);
            if (submission == null)
                throw new Exception("Submission not found.");

            return submission.Feedback.Select(f => new SubmissionFeedbackDto(
                f.Id,
                f.Author.Id,
                f.Author.DisplayName,
                f.Content,
                f.CreatedAt,
                f.UpdatedAt
            )).ToList();
        }
    }
}
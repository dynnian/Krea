namespace Krea.Application.Features.Commissions.GetSubmissions {
    using Domain.Abstractions;
    using Domain.Repositories;
    using Dtos;
    using Microsoft.Extensions.Logging;

    public class GetSubmissionsQueryHandler(
        ICommissionRequestRepository requestRepository,
        ILogger<GetSubmissionsQueryHandler> logger)
        : IRequestHandler<GetSubmissionsQuery, PagedResult<SubmissionDto>>
    {
        public async Task<PagedResult<SubmissionDto>> Handle(GetSubmissionsQuery request, CancellationToken cancellationToken)
        {
            var commissionRequest = await requestRepository.GetByIdWithSubmissionsAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            var submissions = commissionRequest.Submissions
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(s => new SubmissionDto(
                    s.Id,
                    s.MediaId,
                    s.Media.Path,
                    s.Feedback.Select(f => new SubmissionFeedbackDto(f.Id, f.Author.Id, f.Author.DisplayName, f.Content, f.CreatedAt, f.UpdatedAt)).ToList()
                )).ToList();

            return new PagedResult<SubmissionDto>(submissions, commissionRequest.Submissions.Count, request.Page, request.PageSize);
        }
    }
}
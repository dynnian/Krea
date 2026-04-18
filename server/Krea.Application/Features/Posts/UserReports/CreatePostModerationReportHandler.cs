namespace Krea.Application.Features.Posts.UserReports {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class CreatePostModerationReportHandler
        : IRequestHandler<CreatePostModerationReportCommand, CreatePostModerationReportResponse> {
        private readonly IPostRepository _postRepository;
        private readonly IPostModerationReportRepository _reportRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreatePostModerationReportHandler(
            IPostRepository postRepository,
            IPostModerationReportRepository reportRepository,
            IUnitOfWork unitOfWork) {
            _postRepository = postRepository;
            _reportRepository = reportRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<CreatePostModerationReportResponse> Handle(
            CreatePostModerationReportCommand request,
            CancellationToken cancellationToken) {
            if (request.PostId == Guid.Empty)
                throw new ArgumentException("PostId is required.", nameof(request.PostId));

            if (request.ReporterUserId == Guid.Empty)
                throw new ArgumentException("ReporterUserId is required.", nameof(request.ReporterUserId));

            if (string.IsNullOrWhiteSpace(request.Reason))
                throw new ArgumentException("Reason is required.", nameof(request.Reason));

            string normalizedReason = NormalizeReason(request.Reason);

            if (!PostModerationReportReasons.Allowed.Contains(normalizedReason))
                throw new ArgumentException("Invalid report reason.", nameof(request.Reason));

            Post? post = await _postRepository.GetByIdAsync(request.PostId, cancellationToken);

            if (post is null)
                throw new InvalidOperationException("The post does not exist.");

            if (post.IsDeleted)
                throw new InvalidOperationException("Cannot report a deleted post.");

            if (post.AuthorPostId == request.ReporterUserId)
                throw new InvalidOperationException("You cannot report your own post.");

            bool isPending = await _reportRepository.ExistsPendingByPostAndReporterAsync(
                request.PostId,
                request.ReporterUserId,
                cancellationToken);

            if (isPending)
                throw new InvalidOperationException("You already have a pending report for this post.");

            var report = new PostModerationReport(
                request.PostId,
                request.ReporterUserId,
                normalizedReason,
                request.Details
            );

            await _reportRepository.AddAsync(report, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new CreatePostModerationReportResponse(
                report.Id,
                report.PostId,
                report.ReporterUserId,
                report.Reason,
                report.Details,
                report.Status,
                report.CreatedAt
            );
        }

        private static string NormalizeReason(string reason) {
            string trimmed = reason.Trim();

            string? match = PostModerationReportReasons.Allowed
                                                       .FirstOrDefault(r =>
                                                           string.Equals(r, trimmed,
                                                               StringComparison.OrdinalIgnoreCase));

            if (match is null)
                throw new ArgumentException("Invalid report reason.", nameof(reason));

            return match;
        }
    }
}
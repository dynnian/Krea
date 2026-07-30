namespace Krea.Application.Features.Admin.Reports {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;

    public sealed class EvaluateAdminPostModerationReportHandler
        : IRequestHandler<EvaluateAdminPostModerationReportCommand, Unit> {
        private readonly IPostModerationReportRepository _reportRepository;
        private readonly IPostRepository _postRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public EvaluateAdminPostModerationReportHandler(
            IPostModerationReportRepository reportRepository,
            IPostRepository postRepository,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork) {
            _reportRepository = reportRepository;
            _postRepository = postRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(EvaluateAdminPostModerationReportCommand request,
                                       CancellationToken cancellationToken) {
            PostModerationReport? report = await _reportRepository.GetByIdAsync(request.ReportId, cancellationToken);
            if (report is null)
                throw new KeyNotFoundException("Report not found.");

            Post? post = await _postRepository.GetByIdAsync(report.PostId, cancellationToken);
            if (post is null)
                throw new KeyNotFoundException("Reported post not found.");

            switch (request.Action) {
                case PostModerationDecisionAction.Dismiss:
                    break;
                case PostModerationDecisionAction.DeletePost:
                    post.Delete();
                    await _postRepository.UpdateAsync(post, cancellationToken);
                    break;
                case PostModerationDecisionAction.SuspendAuthor:
                    User? author = await _userRepository.GetByIdAsync(post.AuthorPostId, cancellationToken);
                    if (author is null)
                        throw new KeyNotFoundException("Post author not found.");

                    author.Suspend();
                    await _userRepository.UpdateAsync(author, cancellationToken);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(request.Action), request.Action, null);
            }

            report.Resolve(request.Action, request.ActorUserId, request.ModeratorNote);
            await _reportRepository.UpdateAsync(report, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
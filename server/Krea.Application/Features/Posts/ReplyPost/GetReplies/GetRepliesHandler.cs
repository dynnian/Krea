namespace Krea.Application.Features.Posts.ReplyPost.GetReplies {
    using Abstractions;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetRepliesHandler
        : IRequestHandler<GetRepliesQuery, RepliesResponse> {
        private readonly IPostRepository _repository;

        public GetRepliesHandler(IPostRepository repository) => _repository = repository;

        public async Task<RepliesResponse> Handle(
            GetRepliesQuery request,
            CancellationToken cancellationToken) =>
            request.Mode switch {
                ReplyMode.Tree => await HandleTree(request, cancellationToken),
                _ => await HandleFlat(request, cancellationToken)
            };

        private async Task<RepliesResponse> HandleTree(
            GetRepliesQuery request,
            CancellationToken cancellationToken) {
            List<Post> posts = await _repository
                .GetRepliesTreeAsync(request.PostId, cancellationToken);

            List<ReplyNodeResponse> tree = ReplyTreeBuilder.Build(posts, request.PostId);

            return new RepliesResponse { Mode = ReplyMode.Tree.ToString().ToLower(), Tree = tree };
        }

        private async Task<RepliesResponse> HandleFlat(
            GetRepliesQuery request,
            CancellationToken cancellationToken) {
            (IReadOnlyList<Post> posts, int totalCount) = await _repository
                .GetRepliesAsync(
                    request.PostId,
                    request.Page,
                    request.PageSize,
                    cancellationToken);

            List<PostResponse> items = posts
                                    .Select(p => new PostResponse(
                                        p.Id,
                                        p.AuthorPostId,
                                        p.AuthorPost.DisplayName ?? "Unknown",
                                        p.Content ?? "No Content",
                                        p.UploadedAt,
                                        p.AuthorPost.ProfilePicture?.Path
                                    ))
                                    .ToList();
            return new RepliesResponse {
                Mode = ReplyMode.Flat.ToString().ToLower(),
                Flat = new PagedResponse<PostResponse>(
                    items,
                    request.Page,
                    request.PageSize,
                    totalCount)
            };
        }
    }
}
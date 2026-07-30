namespace Krea.Application.Features.Posts.SearchPosts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class SearchPostsHandler
        : IRequestHandler<SearchPostsQuery, PaginatedList<PostSearchItemDto>> {
        private readonly IPostRepository _postRepository;

        public SearchPostsHandler(IPostRepository postRepository) => _postRepository = postRepository;

        public async Task<PaginatedList<PostSearchItemDto>> Handle(
            SearchPostsQuery request,
            CancellationToken cancellationToken) {
            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 20 : request.PageSize;

            if (string.IsNullOrWhiteSpace(request.Query)) {
                return PaginatedList<PostSearchItemDto>.FromItems(
                    Array.Empty<PostSearchItemDto>(),
                    0,
                    page,
                    pageSize);
            }

            PaginatedList<Post> posts = await _postRepository.SearchAsync(
                request.Query.Trim(),
                page,
                pageSize,
                cancellationToken);

            IReadOnlyList<PostSearchItemDto> mappedItems = posts.Items
                                                                .Select(p => {
                                                                    PostUpload? mainUpload = p.Uploads.FirstOrDefault();

                                                                    return new PostSearchItemDto(
                                                                        p.Id,
                                                                        p.AuthorPostId,
                                                                        p.AuthorPost?.DisplayName,
                                                                        p.AuthorPost?.ProfilePicture?.Path,
                                                                        p.Title,
                                                                        p.Content,
                                                                        p.Type.ToString(),
                                                                        mainUpload?.Media?.Path,
                                                                        mainUpload?.CoverMedia?.Path,
                                                                        p.Likes.Count,
                                                                        p.UploadedAt);
                                                                })
                                                                .ToList();

            return PaginatedList<PostSearchItemDto>.FromItems(
                mappedItems,
                posts.TotalCount,
                posts.Page,
                posts.PageSize);
        }
    }
}
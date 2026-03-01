namespace Krea.Application.Features.Posts.GetAllPosts {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetAllPostsHandler
        : IRequestHandler<GetAllPostsQuery, IReadOnlyList<PostDto>> {
        private readonly IPostRepository _repository;

        public GetAllPostsHandler(IPostRepository repository) => _repository = repository;

        public async Task<IReadOnlyList<PostDto>> Handle(
            GetAllPostsQuery request,
            CancellationToken cancellationToken) {
            IReadOnlyList<Post> posts = await _repository.GetAllAsync(
                request.Page,
                request.PageSize,
                cancellationToken);

            return posts.Select(PostDto.FromDomain).ToList();
        }
    }
}
namespace Krea.Application.Features.Posts.GetPostsByUser {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetPostsByUserHandler
        : IRequestHandler<GetPostsByUserQuery, IReadOnlyList<PostDto>> {
        private readonly IPostRepository _repository;

        public GetPostsByUserHandler(IPostRepository repository) => _repository = repository;

        public async Task<IReadOnlyList<PostDto>> Handle(
            GetPostsByUserQuery request,
            CancellationToken cancellationToken) {
            IReadOnlyList<Post> posts = await _repository.GetByUserAsync(
                request.AuthorPostId,
                request.Page,
                request.PageSize,
                cancellationToken);

            return posts.Select(PostDto.FromDomain).ToList();
        }
    }
}
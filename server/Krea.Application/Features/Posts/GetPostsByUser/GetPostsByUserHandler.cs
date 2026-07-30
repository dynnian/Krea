namespace Krea.Application.Features.Posts.GetPostsByUser {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetPostsByUserHandler
        : IRequestHandler<GetPostsByUserQuery, IReadOnlyList<PostDtoV2>> {
        private readonly IPostRepository _repository;
        private readonly IPostFavoriteRepository _favoriteRepository;

        public GetPostsByUserHandler(
            IPostRepository repository,
            IPostFavoriteRepository favoriteRepository) {
            _repository = repository;
            _favoriteRepository = favoriteRepository;
        }

        public async Task<IReadOnlyList<PostDtoV2>> Handle(
            GetPostsByUserQuery request,
            CancellationToken cancellationToken) {
            IReadOnlyList<Post> posts = await _repository.GetByUserAsync(
                request.AuthorPostId,
                request.Page,
                request.PageSize,
                cancellationToken);

            Guid? currentUserId = request.CurrentUserId;

            if (posts.Count == 0)
                return [];

            List<Guid> postIds = posts
                                 .Select(p => p.Id)
                                 .ToList();

            List<Guid> repostTargetIds = posts
                                         .Select(p => p.RepostOfId ?? p.Id)
                                         .Distinct()
                                         .ToList();

            HashSet<Guid> repostedTargetIds = [];
            HashSet<Guid> favoritePostIds = [];

            if (currentUserId is not null) {
                repostedTargetIds = await _repository.GetRepostedTargetIdsAsync(
                    currentUserId.Value,
                    repostTargetIds,
                    cancellationToken);

                favoritePostIds = await _favoriteRepository.GetFavoritePostIdsAsync(
                    currentUserId.Value,
                    postIds,
                    cancellationToken);
            }

            List<PostDtoV2> result = new(posts.Count);

            foreach (Post post in posts) {
                bool isLiked = currentUserId is not null &&
                               post.Likes.Any(l => l.UserId == currentUserId.Value);

                Guid repostTargetId = post.RepostOfId ?? post.Id;

                bool isRetweeted = currentUserId is not null &&
                                   repostedTargetIds.Contains(repostTargetId);

                bool isFavorite = currentUserId is not null &&
                                  favoritePostIds.Contains(post.Id);

                result.Add(PostDtoV2.FromDomain(
                    post,
                    isLiked,
                    isRetweeted,
                    isFavorite));
            }

            return result;
        }
    }
}
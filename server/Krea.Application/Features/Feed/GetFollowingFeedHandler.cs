namespace Krea.Application.Features.Feed {
    using Abstractions.Feed;
    using Posts.Dto;

    public sealed class GetFollowingFeedHandler {
        private readonly IFeedQueryService _feedQueryService;

        public GetFollowingFeedHandler(IFeedQueryService feedQueryService) => _feedQueryService = feedQueryService;

        public async Task<IReadOnlyList<PostFeedResponse>> Handle(
            GetFollowingFeedQuery query,
            CancellationToken ct) =>
            await _feedQueryService.GetFollowingFeedAsync(
                query.CurrentUserId,
                query.Page,
                query.PageSize,
                ct);
    }
}
namespace Krea.Application.Features.Feed {
    using Abstractions.Feed;
    using Posts.Dto;

    public sealed class GetRecentFeedHandler {
        private readonly IFeedQueryService _feedQueryService;

        public GetRecentFeedHandler(IFeedQueryService feedQueryService) => _feedQueryService = feedQueryService;

        public async Task<IReadOnlyList<PostFeedResponse>> Handle(
            GetRecentFeedQuery query,
            CancellationToken ct) =>
            await _feedQueryService.GetRecentAsync(
                query.CurrentUserId,
                query.Page,
                query.PageSize,
                ct);
    }
}
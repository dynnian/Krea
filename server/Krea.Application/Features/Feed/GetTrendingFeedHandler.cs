namespace Krea.Application.Features.Feed {
    using Abstractions.Feed;
    using Posts.Dto;

    public sealed class GetTrendingFeedHandler {
        private readonly IFeedQueryService _feedQueryService;

        public GetTrendingFeedHandler(IFeedQueryService feedQueryService) => _feedQueryService = feedQueryService;

        public async Task<IReadOnlyList<PostFeedResponse>> Handle(
            GetTrendingFeedQuery query,
            CancellationToken ct) =>
            await _feedQueryService.GetTrendingAsync(
                query.CurrentUserId,
                query.Page,
                query.PageSize,
                ct);
    }
}
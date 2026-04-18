namespace Krea.Application.Features.Favorites.Dto {
    public sealed class FavoritePostsResponse {
        public List<FavoritePostDto> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }
}
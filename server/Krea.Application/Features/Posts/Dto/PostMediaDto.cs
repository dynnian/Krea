namespace Krea.Application.Features.Posts.Dto {
    public sealed class PostMediaDto
    {
        public Guid Id { get; init; }

        public string FileName { get; init; } = default!;

        public string MimeType { get; init; } = default!;

        public string Url { get; init; } = default!;

        public bool IsWorkMedia { get; init; }
    }
}
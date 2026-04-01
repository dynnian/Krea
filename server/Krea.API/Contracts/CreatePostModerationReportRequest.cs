namespace Krea.API.Contracts {
    public sealed class CreatePostModerationReportRequest
    {
        public string Reason { get; set; } = default!;
        public string? Details { get; set; }
    }
}
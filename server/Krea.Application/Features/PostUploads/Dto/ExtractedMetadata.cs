namespace Krea.Application.Features.PostUploads.Dto {
    public class ExtractedMetadata
    {
        // comunes
        public string? Title { get; set; }
        public string? Description { get; set; }

        // audio
        public int? DurationSec { get; set; }
        public int? BitrateKbps { get; set; }
        public byte[]? CoverImage { get; set; }

        // image
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string? Format { get; set; }

        // text
        public int? WordCount { get; set; }
        public string? Language { get; set; }
    }
}
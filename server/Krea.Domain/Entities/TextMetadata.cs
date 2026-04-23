using Krea.Domain.Validators;

namespace Krea.Domain.Entities {
    public sealed class TextMetadata : Metadata {
        public string? SortTitle { get; private set; }

        public string? Subtitle { get; private set; }

        [LanguageCode] public string LanguageCode { get; set; }

        public int WordCount { get; private set; }

        #pragma warning disable CS8618
        private TextMetadata() { }
        #pragma warning restore CS8618

        public TextMetadata(
            Guid uploadId,
            string title,
            string? description,
            string? sortTitle,
            string? subtitle,
            string languageCode,
            int wordCount,
            IEnumerable<Genre>? genres = null)
            : base(uploadId, title, description, genres) {
            SortTitle = sortTitle;
            Subtitle = subtitle;
            LanguageCode = languageCode;
            WordCount = wordCount;
        }

        public void UpdateTextInfo(string? subtitle, string language) {
            Subtitle = subtitle;
            LanguageCode = language;
        }

        public TextMetadata Load(
            Guid id,
            Guid uploadId,
            string title,
            string? description,
            int wordCount,
            string languageCode,
            IEnumerable<Genre> genres) {
            var metadata = new TextMetadata {
                Id = id,
                UploadId = uploadId,
                Title = title,
                Description = description,
                WordCount = wordCount,
                LanguageCode = languageCode
            };
            metadata.SetGenres(genres);

            return metadata;
        }
    }
}
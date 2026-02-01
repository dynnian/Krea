using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class TextMetadata {
        public Guid Id { get; private set; }
        public Media Upload { get; private set; }

        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        public string SortTitle { get; private set; }
        public string Subtitle { get; private set; }
        public string Description { get; private set; }

        public string Language { get; private set; }
        public int WordCount { get; private set; }
        public Guid? GenreId { get; private set; }
        public Guid? CollectionId { get; private set; }

        #pragma warning disable CS8618
        private TextMetadata() { }
        #pragma warning disable CS8618

        public TextMetadata(
            Media upload,
            string title,
            string language,
            int wordCount,
            string sortTitle,
            string subtitle,
            string description,
            Guid? genreId = null,
            Guid? collectionId = null)
        {
            Upload = upload ?? throw new ArgumentNullException(nameof(upload));

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required");

            Id = Guid.NewGuid();
            Title = title;
            SortTitle = sortTitle;
            Subtitle = subtitle;
            Description = description;
            Language = language;
            WordCount = wordCount;
            GenreId = genreId;
            CollectionId = collectionId;
        }

        public void AssignToCollection(Guid collectionId) {
            CollectionId = collectionId;
        }
    }
}
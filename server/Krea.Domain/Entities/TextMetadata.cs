using System.ComponentModel.DataAnnotations;
using Krea.Domain.Validators;

namespace Krea.Domain.Entities {
    public sealed class TextMetadata {
        public Guid Id { get; private set; }
        
        public Guid UploadId { get; private set; }

        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        
        [Required(ErrorMessage = "SortTitle is required.")]
        public string SortTitle { get; private set; }
        
        [Required(ErrorMessage = "Subtitle is required.")]
        public string Subtitle { get; private set; }
        
        public string Description { get; private set; }

        [LanguageCode] public string LanguageCode { get; private set; }
        
        public int WordCount { get; private set; }
        
        public Guid? GenreId { get; private set; }
        
        public Guid? SerieCollectionId { get; private set; }

        #pragma warning disable CS8618
        private TextMetadata() { }
        #pragma warning disable CS8618

        public TextMetadata(
            Guid uploadId,
            string title,
            string languageCode,
            int wordCount,
            string sortTitle,
            string subtitle,
            string description,
            Guid? genreId = null,
            Guid? serieCollectionId = null)
        {
            if (uploadId == Guid.Empty 
                || string.IsNullOrWhiteSpace(title) 
                || string.IsNullOrWhiteSpace(sortTitle) 
                ||  string.IsNullOrWhiteSpace(subtitle))
                throw new ArgumentException("Required arguments are missing");

            Id = Guid.NewGuid();
            Title = title;
            SortTitle = sortTitle;
            Subtitle = subtitle;
            Description = description;
            LanguageCode = languageCode;
            WordCount = wordCount;
            GenreId = genreId;
            SerieCollectionId = serieCollectionId;
        }

        public TextMetadata Load(
            Guid id,
            Guid uploadId,
            string title,
            string languageCode,
            int wordCount,
            string sortTitle,
            string subtitle,
            string description,
            Guid? genreId,
            Guid? serieCollectionId
        ) {
            var textMetadata = new TextMetadata {
                Id = id,
                UploadId = uploadId,
                Title = title,
                LanguageCode = languageCode,
                WordCount = wordCount,
                SortTitle = sortTitle,
                Subtitle = subtitle,
                Description =  description,
                GenreId = genreId,
                SerieCollectionId = serieCollectionId
            };
            return textMetadata;
        }

        public void AssignToSerie(Guid collectionId) {
            SerieCollectionId = collectionId;
        }
    }
}
using System.ComponentModel.DataAnnotations;
using Krea.Domain.Validators;

namespace Krea.Domain.Entities {
    public sealed class TextMetadata {
        public Guid Id { get; private set; }
        
        [Required(ErrorMessage = "UploadId is required.")]
        public PostUpload Upload { get; private set; }

        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        
        [Required(ErrorMessage = "SortTitle is required.")]
        public string SortTitle { get; private set; }
        
        [Required(ErrorMessage = "Subtitle is required.")]
        public string Subtitle { get; private set; }
        
        public string Description { get; private set; }

        [LanguageCode] public string LanguageCode { get; private set; }
        
        public int WordCount { get; private set; }
        
        public Genre Genre { get; private set; }
        
        public Collections? SerieCollection { get; private set; }

        #pragma warning disable CS8618
        private TextMetadata() { }
        #pragma warning disable CS8618

        public TextMetadata(
            PostUpload upload,
            string title,
            string languageCode,
            int wordCount,
            string sortTitle,
            string subtitle,
            string description,
            Genre genre = null,
            Collections? serieCollection = null)
        {
            if (upload is null 
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
            Genre = genre;
            SerieCollection = serieCollection;
        }

        public TextMetadata Load(
            Guid id,
            PostUpload upload,
            string title,
            string languageCode,
            int wordCount,
            string sortTitle,
            string subtitle,
            string description,
            Genre genre,
            Collections? serieCollection
        ) {
            var textMetadata = new TextMetadata {
                Id = id,
                Upload = upload,
                Title = title,
                LanguageCode = languageCode,
                WordCount = wordCount,
                SortTitle = sortTitle,
                Subtitle = subtitle,
                Description =  description,
                Genre = genre,
                SerieCollection = serieCollection
            };
            return textMetadata;
        }

        public void AssignToSerie(Collections collection) {
            SerieCollection = collection;
        }
    }
}
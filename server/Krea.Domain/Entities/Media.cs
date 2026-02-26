using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Media {
        
        [Key]
        public Guid Id { get; private init; }
        
        [Required(ErrorMessage = "OriginalFileName is required.")]
        public string OriginalFileName { get; private set; }
        
        public string FileName { get; private set; }
        
        [Required(ErrorMessage = "MimeType is required.")]
        public string MimeType { get; private set; }
        
        [Required(ErrorMessage = "Path is required.")]
        public string Path { get; private set; }
        
        [Timestamp] public DateTime UploadedAt { get; private set; }
        
        #pragma warning disable CS8618
        private Media() { }
        #pragma warning restore CS8618

        public Media(
            string originalFileName,
            string mimeType,
            string path) 
        {
            Validate(originalFileName, mimeType, path);
            Id = Guid.NewGuid(); 
            OriginalFileName = originalFileName;
            FileName = $"{Id}{System.IO.Path.GetExtension(originalFileName)}";
            MimeType = mimeType;
            Path = path;
            UploadedAt = DateTime.UtcNow;
        }
        
        public Media Load(
            Guid id,
            string originalFileName,
            string fileName,
            string mimeType,
            string path,
            DateTime uploadedAt) 
        {
            Validate(originalFileName, mimeType, path);
            var media = new Media {
                Id = id,
                OriginalFileName = originalFileName,
                FileName = fileName,
                MimeType = mimeType,
                Path = path,
                UploadedAt = uploadedAt
            };
            return media;
        }
        
        private static void Validate(string fileName, string mimeType, string path) {
            if (string.IsNullOrWhiteSpace(fileName)
                || string.IsNullOrWhiteSpace(mimeType)
                || string.IsNullOrWhiteSpace(path))
                throw new ArgumentException("All arguments are required");
        }
    }
}
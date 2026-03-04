using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Media {
        [Key] public Guid Id { get; private init; }
        public string OriginalFileName { get; private set; }
        public string FileName { get; private set; }
        public string MimeType { get; private set; }
        public string Path { get; private set; } = null!;
        public DateTime UploadedAt { get; private set; }

        #pragma warning disable CS8618
        private Media() { }
        #pragma warning restore CS8618

        public Media(
            string originalFileName,
            string mimeType) {
            Validate(originalFileName, mimeType);
            Id = Guid.NewGuid();
            OriginalFileName = originalFileName;
            FileName = $"{Id}{System.IO.Path.GetExtension(originalFileName)}";
            MimeType = mimeType;
            UploadedAt = DateTime.UtcNow;
        }

        public Media Load(
            Guid id,
            string originalFileName,
            string fileName,
            string mimeType,
            string path,
            DateTime uploadedAt) {
            Validate(originalFileName, mimeType);
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
        
        public void SetPath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                throw new ArgumentException("Invalid path");

            Path = path;
        }

        private static void Validate(string fileName, string mimeType) {
            if (string.IsNullOrWhiteSpace(fileName)
                || string.IsNullOrWhiteSpace(mimeType))
                throw new ArgumentException("All arguments are required");
        }
    }
}
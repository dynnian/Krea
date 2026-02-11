using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    
    public sealed class ImageMetadata : Metadata
    {
        public string Width { get; private set; }
        
        public string Height { get; private set; }
        
        public int  FileSize { get; private set; }
        
        public string Format { get; private set; }
        
        public Collections? CollageCollection { get; private set; }

        #pragma warning disable CS8618
        private ImageMetadata() { }
        #pragma warning restore CS8618

        public ImageMetadata(
            Guid uploadId,
            string title,
            string? description,
            string width,
            string height,
            int fileSize,
            string format,
            IEnumerable<Genre>? genres = null,
            Collections? collageCollection = null)
            : base(uploadId, title, description, genres)
        {

            if (string.IsNullOrWhiteSpace(format))
                throw new ArgumentException("Format is required.");

            Width = width;
            Height = height;
            FileSize = fileSize;
            Format = format;
        }

        public static ImageMetadata Load(
            Guid id,
            Guid uploadId,
            string title,
            string? description,
            string width,
            string height,
            int fileSize,
            string format,
            IEnumerable<Genre> genres,
            Collections? collageCollection)
        {
            var metadata = new ImageMetadata
            {
                Id = id,
                UploadId = uploadId,
                Title = title,
                Description = description,
                Width = width,
                Height = height,
                FileSize =  fileSize,
                Format = format,
                CollageCollection = collageCollection
            };
            metadata.SetGenres(genres);

            return metadata;
        }

        public void AssignToCollection(Collections collection) {
            CollageCollection = collection;
        }
    }
}
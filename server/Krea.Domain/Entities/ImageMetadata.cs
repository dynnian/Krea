using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    
    public sealed class ImageMetadata {
        
        public Guid Id { get; private set; }
        
        [Required(ErrorMessage = "UploadId is required.")]
        public PostUpload Upload { get; private set; }
        
        public int FileSize { get; private set; }
        
        [StringLength(64), Required(ErrorMessage = "Width is required.")] 
        public string Width { get; private set; }
        
        [StringLength(64), Required(ErrorMessage = "Height is required.")] 
        public string Height { get; private set; }
        
        public Collections? Collection { get; private set; } 
        
        #pragma warning disable CS8618
        private ImageMetadata() { }
        #pragma warning restore CS8618

        public ImageMetadata(
            PostUpload upload,
            int fileSize,
            string width,
            string height)
        {
            if (upload is null
                || string.IsNullOrWhiteSpace(width)
                || string.IsNullOrWhiteSpace(height))
                throw new ArgumentException("Required arguments are missing");
            
            Id = Guid.NewGuid();
            FileSize = fileSize;
            Width = width;
            Height = height;
        }

        public ImageMetadata Load(
            Guid id,
            PostUpload upload,
            int fileSize,
            string width,
            string height,
            Collections? collection 
        )
        {
            if (upload is null
                || string.IsNullOrWhiteSpace(width)
                || string.IsNullOrWhiteSpace(height))
                throw new ArgumentException("Required arguments are missing");
            
            var imageMetadata = new ImageMetadata
            {
                Id = id,
                Upload = upload,
                FileSize = fileSize,
                Width = width,
                Height = height,
                Collection = collection
            };
            return imageMetadata;
        }

        public void AssignToCollection(Collections collection) {
            Collection = collection;
        }
    }
}
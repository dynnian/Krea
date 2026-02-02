using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    
    public sealed class ImageMetadata {
        
        public Guid Id { get; private set; }
        
        public Media Upload { get; private set; }

        public int FileSize { get; private set; }
        
        [StringLength(64), Required(ErrorMessage = "Width is required.")] 
        public string Width { get; private set; }
        
        [StringLength(64), Required(ErrorMessage = "Height is required.")] 
        public string Height { get; private set; }
        public Guid? CollectionId { get; private set; } 
        
        #pragma warning disable CS8618
        private ImageMetadata() { }
        #pragma warning restore CS8618

        public ImageMetadata(
            Media upload,
            int fileSize,
            string width,
            string height,
            Guid? collectionId = null)
        {
            Upload = upload ?? throw new ArgumentNullException(nameof(upload));

            Id = Guid.NewGuid();
            FileSize = fileSize;
            Width = width;
            Height = height;
            CollectionId = collectionId;
        }

        public void AssignToCollection(Guid collectionId) {
            CollectionId = collectionId;
        }
    }
}
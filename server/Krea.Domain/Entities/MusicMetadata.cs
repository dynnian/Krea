using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class MusicMetadata {
        public Guid Id { get; private set; }
        
        public Guid UploadId  { get; private set; }
        
        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        
        [Required(ErrorMessage = "BitrateKbps is required.")]
        public int BitrateKbps { get; private set; }
        
        [Required(ErrorMessage = "DurationSeconds is required.")]
        public int DurationSeconds { get; private set; }

        public Guid GenreId { get; private set; }
        
        public Guid? AlbumCollectionId { get; private set; }

        #pragma warning disable CS8618
        private MusicMetadata() { }
        #pragma warning restore CS8618

        public MusicMetadata(
            Guid uploadId,
            string title,
            int bitrateKbps,
            int durationSeconds,
            Guid genreId)
        {
            if (uploadId == Guid.Empty
                || string.IsNullOrWhiteSpace(title)
                || int.IsNegative(BitrateKbps)
                || int.IsNegative(durationSeconds))
                throw new ArgumentException("Required arguments are missing");

            Id = Guid.NewGuid();
            Title = title;
            BitrateKbps = bitrateKbps;
            DurationSeconds = durationSeconds;
            GenreId = genreId;
        }

        public MusicMetadata Load(
            Guid id,
            Guid uploadId,
            string title,
            int bitrateKbps,
            int durationSeconds,
            Guid genreId,
            Guid? albumCollectionId
        ) {
            if (uploadId == Guid.Empty
                || string.IsNullOrWhiteSpace(title)
                || int.IsNegative(BitrateKbps)
                || int.IsNegative(durationSeconds))
                throw new ArgumentException("Required arguments are required");
            
            var musicMetadata = new MusicMetadata {
                Id = id,
                UploadId = uploadId,
                Title = title,
                BitrateKbps = bitrateKbps,
                DurationSeconds = durationSeconds,
                GenreId = genreId,
                AlbumCollectionId = albumCollectionId
            };
            return musicMetadata;
        }

        public void AssignToAlbum(Guid collectionId) {
            AlbumCollectionId = collectionId;
        }
    }
}
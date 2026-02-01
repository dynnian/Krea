using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class MusicMetadata {
        public Guid Id { get; private set; }
        public Media Upload { get; private set; }
        
        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        public int BitrateKbps { get; private set; }
        public int DurationSeconds { get; private set; }

        public Guid? GenreId { get; private set; }
        public Guid? AlbumCollectionId { get; private set; }

        #pragma warning disable CS8618
        private MusicMetadata() { }
        #pragma warning restore CS8618

        public MusicMetadata(
            Media upload,
            string title,
            int bitrateKbps,
            int durationSeconds,
            Guid? genreId = null,
            Guid? albumCollectionId = null)
        {
            Upload = upload ?? throw new ArgumentNullException(nameof(upload));

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required");

            Id = Guid.NewGuid();
            Title = title;
            BitrateKbps = bitrateKbps;
            DurationSeconds = durationSeconds;
            GenreId = genreId;
            AlbumCollectionId = albumCollectionId;
        }

        public void AssignToAlbum(Guid collectionId) {
            AlbumCollectionId = collectionId;
        }
    }
}
using System.ComponentModel.DataAnnotations;
using Microsoft.VisualBasic;

namespace Krea.Domain.Entities {
    public sealed class MusicMetadata {
        public Guid Id { get; private set; }
        
        [Required(ErrorMessage = "UploadId is required.")]
        public PostUpload Upload  { get; private set; }
        
        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; private set; }
        
        [Required(ErrorMessage = "BitrateKbps is required.")]
        public int BitrateKbps { get; private set; }
        
        [Required(ErrorMessage = "DurationSeconds is required.")]
        public int DurationSeconds { get; private set; }

        public Genre Genre { get; private set; }
        
        public Collections? AlbumCollection { get; private set; }

        #pragma warning disable CS8618
        private MusicMetadata() { }
        #pragma warning restore CS8618

        public MusicMetadata(
            PostUpload upload,
            string title,
            int bitrateKbps,
            int durationSeconds,
            Genre genre)
        {
            if (upload is null
                || string.IsNullOrWhiteSpace(title)
                || int.IsNegative(BitrateKbps)
                || int.IsNegative(durationSeconds))
                throw new ArgumentException("Required arguments are missing");

            Id = Guid.NewGuid();
            Title = title;
            BitrateKbps = bitrateKbps;
            DurationSeconds = durationSeconds;
            Genre = genre;
        }

        public MusicMetadata Load(
            Guid id,
            PostUpload upload,
            string title,
            int bitrateKbps,
            int durationSeconds,
            Genre genre,
            Collections? albumCollection
        ) {
            if (upload is null
                || string.IsNullOrWhiteSpace(title)
                || int.IsNegative(BitrateKbps)
                || int.IsNegative(durationSeconds))
                throw new ArgumentException("Required arguments are required");
            
            var musicMetadata = new MusicMetadata {
                Id = id,
                Upload = upload,
                Title = title,
                BitrateKbps = bitrateKbps,
                DurationSeconds = durationSeconds,
                Genre = genre,
                AlbumCollection = albumCollection
            };
            return musicMetadata;
        }

        public void AssignToAlbum(Collections collection) {
            AlbumCollection = collection;
        }
    }
}
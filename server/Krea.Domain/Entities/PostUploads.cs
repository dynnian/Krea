using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class PostUpload {
        [Key] public Guid Id { get; private set; }

        public Guid PostId { get; private set; }
        public Post Post { get; private set; } = default!;

        public Guid MediaId { get; private set; }
        public Media Media { get; private set; } = default!;

        public Guid? CoverMediaId { get; private set; }
        public Media? CoverMedia { get; private set; }

        public bool IsWorkMedia { get; private set; }

        public Metadata? Metadata { get; private set; }

        #pragma warning disable CS8618
        private PostUpload() { }
        #pragma warning restore CS8618

        public PostUpload(Guid postId, Guid mediaId, bool isWorkMedia) {
            Id = Guid.NewGuid();
            PostId = postId;
            MediaId = mediaId;
            IsWorkMedia = isWorkMedia;
        }

        public void SetMetadata(Metadata metadata) => Metadata = metadata;

        public void SetCover(Guid coverMediaId) => CoverMediaId = coverMediaId;

        public void RemoveCover() => CoverMediaId = null;
    }
}
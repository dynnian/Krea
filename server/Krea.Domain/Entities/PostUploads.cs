using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class PostUpload {
        [Key] public Guid Id { get; private set; }

        public Guid PostId { get; private set; }
        public Post Post { get; private set; }

        public Guid MediaId { get; private set; }
        public Media Media { get; private set; }
        public bool IsWorkMedia { get; private set; }
        public Metadata? Metadata { get; private set; }

        #pragma warning disable CS8618
        private PostUpload() { }
        #pragma warning restore CS8618

        internal PostUpload(
            Guid postId,
            Guid mediaId,
            bool isWorkMedia) {
            Id = Guid.NewGuid();
            PostId = postId;
            MediaId = mediaId;
            IsWorkMedia = isWorkMedia;
        }

        public static PostUpload Load(
            Guid id,
            Guid postId,
            Guid mediaId,
            bool isWorkMedia
        ) {
            var upload = new PostUpload(postId, mediaId, isWorkMedia);
            upload.Id = id;
            return upload;
        }

        public void MarkAsWorkMedia() => IsWorkMedia = true;

        public void SetMetadata(Metadata metadata) {
            if (Metadata is not null)
                throw new InvalidOperationException("Metadata already assigned.");

            if (metadata.UploadId != Id)
                throw new InvalidOperationException("Metadata does not belong to this upload.");

            Metadata = metadata;
        }
    }
}
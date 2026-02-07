namespace Krea.Domain.Entities {
    public sealed class PostUpload {
        public Guid UploadId { get; private set; }
        public Guid MediaId { get; private set; }
        public bool IsWorkMedia { get; private set; }

        #pragma warning disable CS8618
        private PostUpload() { }
        #pragma warning restore CS8618

        public PostUpload(
            Guid uploadId,
            Guid mediaId,
            bool isWorkMedia
        ) {
            UploadId = uploadId;
            MediaId = mediaId;
            IsWorkMedia = isWorkMedia;   
        }

        public PostUpload Load(
            Guid uploadId,
            Guid mediaId,
            bool isWorkMedia
        ) {
            var postUploads = new PostUpload {
                UploadId = uploadId,
                MediaId = mediaId,
                IsWorkMedia = isWorkMedia
            };
            return postUploads;
        }

        public void MarkAsWorkMedia() {
            IsWorkMedia = true;
        }
    }
}
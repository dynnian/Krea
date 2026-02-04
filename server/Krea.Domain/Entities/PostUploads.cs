namespace Krea.Domain.Entities {
    public sealed class PostUpload {
        public Guid UploadId { get; private set; }
        public Guid MediaId { get; private set; }
        public bool IsWorkMedia { get; private set; }

        #pragma warning disable CS8618
        private PostUpload() { }
        #pragma warning restore CS8618

        internal PostUpload(Guid uploadId, Guid mediaId, bool isWorkMedia) {
            UploadId = uploadId;
            MediaId = mediaId;
            IsWorkMedia = isWorkMedia;
        }

        internal void MarkAsWorkMedia() {
            IsWorkMedia = true;
        }
    }
}
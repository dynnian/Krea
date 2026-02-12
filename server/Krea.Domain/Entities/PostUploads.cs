using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class PostUpload {
        [Key]
        public Guid Id { get; private set; }
        
        public Guid PostId { get; private set; }
        public Post Post { get; private set; }
        
        public Guid MediaId { get; private set; }
        public Media Media { get; private set; }
        public bool IsWorkMedia { get; private set; }

        #pragma warning disable CS8618
        private PostUpload() { }
        #pragma warning restore CS8618

        public PostUpload(
            Post post, 
            Media media,
            bool isWorkMedia
        ) {
            Id = Guid.NewGuid(); 
            Post = post;
            Media = media;
            IsWorkMedia = isWorkMedia;   
        }

        public PostUpload Load(
            Guid id,
            Post post,
            Media media,
            bool isWorkMedia
        ) {
            var postUploads = new PostUpload {
                Id = id,
                Post = post,
                Media = media,
                IsWorkMedia = isWorkMedia
            };
            return postUploads;
        }

        public void MarkAsWorkMedia() {
            IsWorkMedia = true;
        }
    }
}
using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Hashtag
    {
        [Key]
        public Guid Id { get; private set; }
        
        public string Name { get; private set; }
        
        private readonly List<Post> _posts = new();
        public IReadOnlyCollection<Post> Posts => _posts.AsReadOnly();

        #pragma warning disable CS8618 
        private Hashtag() { } 
        #pragma warning restore CS8618

        public Hashtag(string name) {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name argument is missing");
            
            Id = Guid.NewGuid();
            Name = name;
        }
        
        public Hashtag Load (
            Guid id, 
            string name
            ) {
            var hashtag = new Hashtag
            {
                Id = id,
                Name = name
            };
            return hashtag;
        }
    }
}
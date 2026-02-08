using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public class Hashtag
    {
        public Guid Id { get; private set; }
        
        [StringLength(32), Required(ErrorMessage = "Name is required")]
        public string Name { get; private set; } 

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
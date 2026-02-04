using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public class Hashtag
    {
        public Guid Id { get; private set; }
        
        [StringLength(32), Required(ErrorMessage = "Name is required")]
        public string Name { get; private set; }
    }
}
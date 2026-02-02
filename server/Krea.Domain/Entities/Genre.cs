using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Genre {
        public Guid Id { get; private set; }
        
        [StringLength(32), Required(ErrorMessage = "Name is required")]
        public string Name { get; private set; }
        public GenreType Type { get; private set; }
    }
}
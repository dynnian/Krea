using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities
{
    public sealed class Scope {
        public Guid Id {get; private set;}
        
        [StringLength(64),  Required(ErrorMessage = "Name is required")]
        public string Name {get; private set;}
    }
}

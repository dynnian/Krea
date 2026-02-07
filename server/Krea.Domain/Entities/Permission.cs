using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Permission {
        public Guid Id { get; private set; }
        [StringLength(32)] public string Name { get; private set; }
        [StringLength(256)] public string Description { get; private set; }
        [Timestamp] public DateTime CreatedAt { get; private set; }
        
        #pragma warning disable CS8618
        private Permission() { }
        #pragma warning restore CS8618

        public Permission(
            string name,
            string description,
            DateTime createdAt
        ) {
            Validate(name, description);
            
            Id = Guid.NewGuid(); 
            Name = name; 
            Description = description;
            CreatedAt = DateTime.UtcNow;  
        }

        public Permission Load(
            Guid id,
            string name,
            string description,
            DateTime createdAt
        ) {
            Validate(name, description);
            
            var permission = new Permission {
                Id = id,
                Name = name,
                Description = description,
                CreatedAt = createdAt
            };
            return permission;
        }
        
        private static void Validate(string name, string description) {
            if (string.IsNullOrWhiteSpace(name)
                || string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("All arguments are required");
        }
    }
}
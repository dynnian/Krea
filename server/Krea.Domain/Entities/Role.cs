using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Role {
        public Guid Id { get; private set; }
        [StringLength(32)] public string Name { get; private set; }
        [StringLength(256)] public string Description { get; private set; }
        public IReadOnlyList<Permission> Permissions => _permissions.AsReadOnly();
        private readonly List<Permission> _permissions = new();
        [Timestamp] public DateTime CreatedAt { get; private set; }

        #pragma warning disable CS8618
        private Role() { }
        #pragma warning restore CS8618

        public Role(
            string name,
            string description,
            DateTime createdAt
        ) {
            Id = Guid.NewGuid();
            Name = name;
            Description = description;
            CreatedAt = DateTime.UtcNow;
        }

        public Role Load(
            Guid id,
            string name,
            string description,
            DateTime createdAt
        ) {
            var role = new Role { Id = id, Name = name, Description = description, CreatedAt = createdAt };
            return role;
        }
    }
}
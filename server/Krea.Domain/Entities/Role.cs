using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Role {
        public Guid Id { get; private set; }
        [StringLength(32)] public string Name { get; private set; }
        [StringLength(256)] public string Description { get; private set; }
        public IReadOnlyList<Permission> Permissions => _permissions.AsReadOnly();
        private List<Permission> _permissions;
        [Timestamp] public DateTime CreatedAt { get; private set; }
    }
}
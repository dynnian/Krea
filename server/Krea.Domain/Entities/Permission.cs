using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public sealed class Permission {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }

        public Scope Scope { get; private set; } = null!;
        public Guid ScopeId { get; private set; }
        public DateTime CreatedAt { get; private set; }

        #pragma warning disable CS8618
        private Permission() { }
        #pragma warning restore CS8618

        public Permission(
            string name,
            string description,
            Guid scopeId
        ) {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Permission name is required");

            Id = Guid.NewGuid();
            Name = name.Trim();
            Description = description ?? string.Empty;
            ScopeId = scopeId;
            CreatedAt = DateTime.UtcNow;
        }

        public Permission Load(
            Guid id,
            string name,
            string description,
            Scope scope,
            DateTime createdAt
        ) {
            var permission = new Permission {
                Id = id,
                Name = name,
                Description = description,
                Scope = scope,
                CreatedAt = createdAt
            };
            return permission;
        }
    }
}
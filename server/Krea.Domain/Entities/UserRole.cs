namespace Krea.Domain.Entities {
    public sealed class UserRole {
        public Guid UserId { get; private set; }
        public User User { get; private set; } = null!;

        public Guid RoleId { get; private set; }
        public Role Role { get; private set; } = null!;

        public DateTime AssignedAt { get; private set; }
        public Guid? AssignedBy { get; private set; }

        #pragma warning disable CS8618
        private UserRole() { }
        #pragma warning restore CS8618

        public UserRole(Guid userId, Guid roleId, Guid? assignedBy) {
            UserId = userId;
            RoleId = roleId;
            AssignedBy = assignedBy;
            AssignedAt = DateTime.UtcNow;
        }
    }
}
namespace Krea.Domain.Entities {
    using System.ComponentModel.DataAnnotations;

    public sealed class Follow {
        [Key] public Guid Id { get; private set; }

        public Guid SourceId { get; private set; }
        public User Source { get; private set; } = null!;

        public Guid TargetId { get; private set; }
        public User Target { get; private set; } = null!;

        public DateTime FollowedAt { get; private set; }

#pragma warning disable CS8618
        private Follow() { }
#pragma warning restore CS8618

        public Follow(Guid sourceId, Guid targetId) {
            if (sourceId == targetId)
                throw new InvalidOperationException("User cannot follow himself.");

            Id = Guid.NewGuid();
            SourceId = sourceId;
            TargetId = targetId;
            FollowedAt = DateTime.UtcNow;
        }
    }
}
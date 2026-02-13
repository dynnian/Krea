using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Like {
        [Key]
        public Guid Id { get; private set; }
        
        public Guid UserId {get; private set;}
        public User User { get; private set; }
        public LikeTargetType TargetType { get; private set; }
        public Guid TargetId { get; private set; }
        [Timestamp] public DateTime CreatedAt { get; private set; }

        #pragma warning disable CS8618
        private Like() { }
        #pragma warning restore CS8618

        public Like(
            User user,
            LikeTargetType targetType,
            Guid targetId
            ) 
        {
            Id = Guid.NewGuid();
            User = user;
            TargetType = targetType;
            TargetId = targetId;
            CreatedAt = DateTime.UtcNow;
        }

        public Like Load(
            Guid id,
            User user,
            LikeTargetType targetType,
            Guid targetId,
            DateTime createdAt) {
            return new Like
            {
                Id = id,
                User = user,
                TargetType = targetType,
                TargetId = targetId,
                CreatedAt = createdAt
            };
        }
    }
}
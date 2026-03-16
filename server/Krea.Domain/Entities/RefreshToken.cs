namespace Krea.Domain.Entities {
    public sealed class RefreshToken
    {
        public Guid Id { get; private set; }
        public string Token { get; private set; }
        public Guid UserId { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public bool IsRevoked { get; private set; }
        public bool IsUsed { get; private set; }
        public string? ReplacedByToken { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? RevokedAt { get; private set; }
        
        #pragma warning disable CS8618
        private RefreshToken() { }
        #pragma warning restore CS8618
        
        public RefreshToken(string token, Guid userId, DateTime expiresAt)
        {
            Id = Guid.NewGuid();
            Token = token ?? throw new ArgumentNullException(nameof(token));
            UserId = userId;
            ExpiresAt = expiresAt;
            CreatedAt = DateTime.UtcNow;
            IsRevoked = false;
            IsUsed = false;
        }

        public void MarkAsUsed(string replacedByToken)
        {
            IsUsed = true;
            ReplacedByToken = replacedByToken;
        }

        public void Revoke()
        {
            IsRevoked = true;
            RevokedAt = DateTime.UtcNow;
        }

        public bool IsActive => !IsRevoked && !IsUsed && ExpiresAt > DateTime.UtcNow;
    }
}
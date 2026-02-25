namespace Krea.Domain.ValueObjects
{
    public readonly struct Money : IEquatable<Money>
    {
        public decimal Amount { get; }

        public Money(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.", nameof(amount));
            Amount = amount;
        }
        
        public bool Equals(Money other) => Amount == other.Amount;

        public override bool Equals(object? obj) => obj is Money other && Equals(other);

        public override int GetHashCode() => Amount.GetHashCode();
        
        public static bool operator ==(Money left, Money right) => left.Equals(right);
        public static bool operator !=(Money left, Money right) => !(left == right);
        
        public static implicit operator decimal(Money money) => money.Amount;

        public override string ToString() => Amount.ToString("0.00");
    }
}
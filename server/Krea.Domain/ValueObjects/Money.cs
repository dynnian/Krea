namespace Krea.Domain.ValueObjects
{
    public readonly struct Money : IEquatable<Money>
    {
        public decimal Amount { get; }
        public string Currency { get; }

        public Money(decimal amount, string currency = "USD")
        {
            if (amount < 0)
                throw new ArgumentException("Amount cannot be negative.", nameof(amount));

            if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3)
                throw new ArgumentException("Currency must be a 3-letter ISO code.", nameof(currency));

            Amount = amount;
            Currency = currency.ToUpperInvariant();
        }

        public bool Equals(Money other) =>
            Amount == other.Amount && Currency == other.Currency;

        public override bool Equals(object? obj) =>
            obj is Money other && Equals(other);

        public override int GetHashCode() =>
            HashCode.Combine(Amount, Currency);
        
        public static Money Zero(string currency = "USD") => new(0, currency);

        public static bool operator ==(Money left, Money right) => left.Equals(right);
        public static bool operator !=(Money left, Money right) => !(left == right);

        public static Money operator +(Money a, Money b) {
            return a.Currency != b.Currency ? 
                throw new InvalidOperationException("Cannot add money with different currencies.") 
                : new Money(a.Amount + b.Amount, a.Currency);
        }

        public static Money operator -(Money a, Money b) {
            return a.Currency != b.Currency ? 
                throw new InvalidOperationException("Cannot subtract money with different currencies.") 
                : new Money(a.Amount - b.Amount, a.Currency);
        }

        public static Money operator *(Money money, decimal multiplier) =>
            new Money(money.Amount * multiplier, money.Currency);
        
        public static bool operator >(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException("Cannot compare money with different currencies.");

            return a.Amount > b.Amount;
        }

        public static bool operator <(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException("Cannot compare money with different currencies.");

            return a.Amount < b.Amount;
        }

        public static bool operator >=(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException("Cannot compare money with different currencies.");

            return a.Amount >= b.Amount;
        }

        public static bool operator <=(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException("Cannot compare money with different currencies.");

            return a.Amount <= b.Amount;
        }

        public override string ToString() =>
            $"{Currency} {Amount:0.00}";
    }
}
namespace Krea.Domain.ValueObjects {
    public readonly struct Money {
        public decimal Amount { get; }

        public Money(decimal amount) {
            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");
            Amount = amount;
        }

        public static implicit operator decimal(Money money) => money.Amount;
        public override string ToString() => Amount.ToString("0.00");
    }
}

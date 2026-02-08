namespace Krea.Domain.ValueObjects {
    public sealed class ExternalPaymentRef {
        public string Value { get; }

        public ExternalPaymentRef(string value) {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("External reference is required.");
            Value = value;
        }

        public override string ToString() => Value;
    }
}
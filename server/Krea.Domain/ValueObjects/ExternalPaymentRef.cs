namespace Krea.Domain.ValueObjects {
    public sealed class ExternalPaymentRef {
        public string Provider { get; }
        public string Value { get; }

        public ExternalPaymentRef(string provider, string value) {
            if (string.IsNullOrWhiteSpace(provider))
                throw new ArgumentException("Provider is required.", nameof(provider));
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("External reference is required.", nameof(value));

            Provider = provider.ToLowerInvariant();
            Value = value;
        }

        public override string ToString() => $"{Provider}:{Value}";
    }
}
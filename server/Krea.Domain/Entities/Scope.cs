namespace Krea.Domain.Entities {
    public sealed class Scope {
        public Guid Id { get; private set; }

        public string Name { get; private set; }

        private readonly List<Permission> _permissions = new();
        public IReadOnlyCollection<Permission> Permissions => _permissions.AsReadOnly();

        #pragma warning disable CS8618
        private Scope() { }
        #pragma warning restore CS8618

        public Scope(string name) {
            Validate(name);

            Id = Guid.NewGuid();
            Name = name;
        }

        public Scope Load(
            Guid id,
            string name) {
            Validate(name);

            var scope = new Scope { Id = id, Name = name };
            return scope;
        }

        private static void Validate(string name) {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("All arguments are required");
        }
    }
}
using System.ComponentModel.DataAnnotations;
using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class Genre {
        [Key] public Guid Id { get; private set; }

        public string Name { get; private set; }

        public GenreType Type { get; private set; }

        #pragma warning disable CS8618
        private Genre() { }
        #pragma warning restore CS8618

        public Genre(
            string name,
            GenreType type
        ) {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name argument is missing");
            Id = Guid.NewGuid();
            Name = name;
            Type = type;
        }

        public Genre Load(
            Guid id,
            string name,
            GenreType type
        ) {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name argument is missing");

            var genre = new Genre { Id = id, Name = name, Type = type };
            return genre;
        }
    }
}
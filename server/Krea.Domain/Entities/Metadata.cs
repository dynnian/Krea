using System.ComponentModel.DataAnnotations;

namespace Krea.Domain.Entities {
    public abstract class Metadata {
        [Key]
        public Guid Id { get; protected set; }

        public Guid UploadId { get; protected set; }
        
        public PostUpload Upload { get; protected set; } = null!;

        private readonly List<Genre> _genres = new();
        public IReadOnlyCollection<Genre> Genres => _genres.AsReadOnly();

        public string Title { get; protected set; } = null!;
        
        public string? Description { get; protected set; }

        #pragma warning disable CS8618
        protected Metadata() { }
        #pragma warning restore CS8618
        
        protected Metadata(
            Guid uploadId,
            string title,
            string? description,
            IEnumerable<Genre>? genres = null)
        {
            Id = Guid.NewGuid();
            UploadId = uploadId;
            Title = title;
            Description = description;

            if (genres != null)
                _genres.AddRange(genres);
        }

        public void AddGenre(Genre genre)
        {
            if (_genres.Any(g => g.Id == genre.Id))
                return;
            _genres.Add(genre);
        }

        public void RemoveGenre(Guid genreId)
        {
            var genre = _genres.FirstOrDefault(g => g.Id == genreId);
            if (genre != null)
                _genres.Remove(genre);
        }
        
        protected void SetGenres(IEnumerable<Genre> genres)
        {
            _genres.Clear();
            foreach (var genre in genres)
                AddGenre(genre);
        }
    }
}
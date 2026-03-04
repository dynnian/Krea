namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public class GenreRepository : IGenreRepository
    {
        private readonly AppDbContext _context;

        public GenreRepository(AppDbContext context) => _context = context;

        public async Task<List<Genre>> GetByIdsAsync(List<Guid> ids, CancellationToken cancellationToken = default) =>
            await _context.Genres
                .Where(g => ids.Contains(g.Id))
                .ToListAsync(cancellationToken);
    }
}
namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public class GenreRepository : IGenreRepository {
        private readonly AppDbContext _context;

        public GenreRepository(AppDbContext context) => _context = context;

        public async Task<IReadOnlyList<Genre>> GetAllAsync( CancellationToken cancellationToken) {
            return await _context.Genres
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<Genre>> GetByIdsAsync(
            IReadOnlyList<Guid> ids,
            CancellationToken cancellationToken)
        {
            return await _context.Genres
                .Where(g => ids.Contains(g.Id))
                .ToListAsync(cancellationToken);
        }
    }
}
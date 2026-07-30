namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;
    using Microsoft.EntityFrameworkCore;

    public class PostUploadRepository : IPostUploadRepository {
        private readonly AppDbContext _context;

        public PostUploadRepository(AppDbContext context) => _context = context;

        public async Task AddAsync(PostUpload upload, CancellationToken cancellationToken = default) =>
            await _context.PostUploads.AddAsync(upload, cancellationToken);

        public async Task<PostUpload?> GetByIdWithMetadataAsync(Guid uploadId,
                                                                CancellationToken cancellationToken = default) =>
            await _context.PostUploads
                          .Include(u => u.Metadata)
                          .ThenInclude(m => m!.Genres)
                          .FirstOrDefaultAsync(u => u.Id == uploadId, cancellationToken);
    }
}
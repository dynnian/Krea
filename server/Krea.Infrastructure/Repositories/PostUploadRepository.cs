namespace Krea.Infrastructure.Repositories {
    using Data;
    using Domain.Entities;
    using Domain.Repositories;

    public class PostUploadRepository : IPostUploadRepository
    {
        private readonly AppDbContext _context;

        public PostUploadRepository(AppDbContext context) => _context = context;

        public async Task AddAsync(PostUpload upload, CancellationToken cancellationToken = default) =>
            await _context.PostUploads.AddAsync(upload, cancellationToken);
    }
}
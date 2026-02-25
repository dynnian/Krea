using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IMediaRepository {
        Task<Media?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<Media?> GetByFileNameAsync(string fileName, CancellationToken cancellationToken = default);

        Task<bool> ExistsByFileNameAsync(string fileName, CancellationToken cancellationToken = default);

        Task AddAsync(Media media, CancellationToken cancellationToken = default);

        void Update(Media media);

        void Remove(Media media);

        Task DeleteAsync(Media media, CancellationToken cancellationToken = default);
    }
}
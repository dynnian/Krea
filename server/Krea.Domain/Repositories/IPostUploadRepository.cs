namespace Krea.Domain.Repositories {
    using Entities;

    public interface IPostUploadRepository {
        Task AddAsync(PostUpload upload, CancellationToken cancellationToken = default);
    }
}
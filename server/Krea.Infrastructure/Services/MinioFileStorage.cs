namespace Krea.Infrastructure.Services {
    using Application.Abstractions.FileStorage;
    using Minio;
    using Minio.DataModel.Args;

    public sealed class MinioFileStorage : IFileStorage
    {
        private readonly IMinioClient _minioClient;
        private const string BucketName = "uploads";

        public MinioFileStorage(IMinioClient minioClient)
        {
            _minioClient = minioClient;
        }

        public async Task<FileStorageResult> SaveAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            long size,
            CancellationToken cancellationToken)
        {
            bool found = await _minioClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(BucketName),
                cancellationToken);

            if (!found)
            {
                await _minioClient.MakeBucketAsync(
                    new MakeBucketArgs().WithBucket(BucketName),
                    cancellationToken);
            }

            var objectName = $"posts/{Guid.NewGuid()}_{fileName}";

            await _minioClient.PutObjectAsync(
                new PutObjectArgs()
                    .WithBucket(BucketName)
                    .WithObject(objectName)
                    .WithStreamData(fileStream)
                    .WithObjectSize(size)
                    .WithContentType(contentType),
                cancellationToken);

            var url = $"http://localhost:9000/{BucketName}/{objectName}";

            return new FileStorageResult
            {
                Url = url,
                FileName = objectName,
                ContentType = contentType,
                Size = size
            };
        }
    }
}
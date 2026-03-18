namespace Krea.Infrastructure.Services {
    using Application.Abstractions.FileStorage;
    using Minio;
    using Minio.DataModel.Args;
    using NLog;

    public sealed class MinioFileStorage : IFileStorage
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        private readonly IMinioClient _minioClient;
        private readonly string _baseUrl;
        private const string BucketName = "uploads";

        public MinioFileStorage(IMinioClient minioClient, string baseUrl)
        {
            _minioClient = minioClient;
            _baseUrl = baseUrl;
        }

        public async Task<FileStorageResult> SaveAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            long size,
            CancellationToken cancellationToken)
        {
            try
            {
                var safeFileName = Path.GetFileName(fileName);
                var objectName = $"posts/{Guid.NewGuid()}_{safeFileName}";
                
                await EnsureBucketExists(cancellationToken);

                // Subir archivo
                await _minioClient.PutObjectAsync(
                    new PutObjectArgs()
                        .WithBucket(BucketName)
                        .WithObject(objectName)
                        .WithStreamData(fileStream)
                        .WithObjectSize(size)
                        .WithContentType(contentType),
                    cancellationToken);

                var url = $"{_baseUrl}/{BucketName}/{objectName}";

                Logger.Info("File uploaded: {ObjectName}", objectName);

                return new FileStorageResult
                {
                    Url = url,
                    FileName = objectName,
                    ContentType = contentType,
                    Size = size
                };
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Error uploading file: {FileName}", fileName);
                throw;
            }
        }
        
        public async Task DeleteAsync(string fileName, CancellationToken cancellationToken)
        {
            try
            {
                await _minioClient.RemoveObjectAsync(
                    new RemoveObjectArgs()
                        .WithBucket(BucketName)
                        .WithObject(fileName),
                    cancellationToken);
            }
            catch (Exception)
            {
                // No se lanza error
            }
        }

        private async Task EnsureBucketExists(CancellationToken cancellationToken)
        {
            var found = await _minioClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(BucketName),
                cancellationToken);

            if (!found)
            {
                Logger.Warn("Bucket '{BucketName}' not found. Creating...", BucketName);

                await _minioClient.MakeBucketAsync(
                    new MakeBucketArgs().WithBucket(BucketName),
                    cancellationToken);
            }
        }
    }
}
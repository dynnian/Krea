namespace Krea.Infrastructure.Services {
    using Application.Abstractions.FileStorage;
    using Minio;
    using Minio.DataModel.Args;
    using NLog;

    public sealed class MinioFileStorage : IFileStorage {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        private readonly IMinioClient _minioClient;
        private readonly string _baseUrl;
        private readonly string _bucketName;

        public MinioFileStorage(IMinioClient minioClient, string baseUrl, string bucketName) {
            _minioClient = minioClient;
            _baseUrl = baseUrl;
            _bucketName = string.IsNullOrWhiteSpace(bucketName) ? "uploads" : bucketName;
        }

        public async Task<FileStorageResult> SaveAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            long size,
            CancellationToken cancellationToken,
            string? folder = null) {
            try {
                string objectName;

                if (!string.IsNullOrWhiteSpace(folder)) {
                    string normalizedFolder = folder.Trim().Trim('/');
                    string safeFileName = Path.GetFileName(fileName);
                    objectName = $"{normalizedFolder}/{safeFileName}";
                }
                else {
                    objectName = fileName.Replace("\\", "/").TrimStart('/');
                }

                if (string.IsNullOrWhiteSpace(objectName))
                    throw new InvalidOperationException("Invalid object name for storage.");

                await EnsureBucketExists(cancellationToken);

                await _minioClient.PutObjectAsync(
                    new PutObjectArgs()
                        .WithBucket(_bucketName)
                        .WithObject(objectName)
                        .WithStreamData(fileStream)
                        .WithObjectSize(size)
                        .WithContentType(contentType),
                    cancellationToken);

                string cleanBaseUrl = _baseUrl.Trim('\"', ' ').TrimEnd('/');
                if (!cleanBaseUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) && 
                    !cleanBaseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) &&
                    !cleanBaseUrl.StartsWith("//", StringComparison.OrdinalIgnoreCase)) {
                    cleanBaseUrl = "https://" + cleanBaseUrl;
                }
                string url = $"{cleanBaseUrl}/{_bucketName}/{objectName}";

                Logger.Info("File uploaded: {ObjectName}", objectName);

                return new FileStorageResult {
                    Url = url, FileName = objectName, ContentType = contentType, Size = size
                };
            }
            catch (Exception ex) {
                Logger.Error(ex, "Error uploading file: {FileName}", fileName);
                throw;
            }
        }

        public async Task DeleteAsync(string fileName, CancellationToken cancellationToken) {
            try {
                await _minioClient.RemoveObjectAsync(
                    new RemoveObjectArgs()
                        .WithBucket(_bucketName)
                        .WithObject(fileName),
                    cancellationToken);
            }
            catch (Exception) {
                // No se lanza error
            }
        }

        private async Task EnsureBucketExists(CancellationToken cancellationToken) {
            bool found = await _minioClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(_bucketName),
                cancellationToken);

            if (!found) {
                Logger.Warn("Bucket '{BucketName}' not found. Creating...", _bucketName);

                await _minioClient.MakeBucketAsync(
                    new MakeBucketArgs().WithBucket(_bucketName),
                    cancellationToken);
            }
        }
    }
}
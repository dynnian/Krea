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
                string extension = Path.GetExtension(fileName);
                string uniqueId = Guid.NewGuid().ToString();

                if (!string.IsNullOrWhiteSpace(folder)) {
                    string normalizedFolder = folder.Trim().Trim('/');
                    objectName = $"{normalizedFolder}/{uniqueId}{extension}";
                }
                else {
                    objectName = $"{uniqueId}{extension}";
                }

                await EnsureBucketExists(cancellationToken);

                await _minioClient.PutObjectAsync(
                    new PutObjectArgs()
                        .WithBucket(_bucketName)
                        .WithObject(objectName)
                        .WithStreamData(fileStream)
                        .WithObjectSize(size)
                        .WithContentType(contentType),
                    cancellationToken);

                string url = BuildUrl(objectName);

                Logger.Info("File uploaded: {ObjectName} -> {Url}", objectName, url);

                return new FileStorageResult {
                    Url = url, FileName = objectName, ContentType = contentType, Size = size
                };
            }
            catch (Exception ex) {
                Logger.Error(ex, "Error uploading file: {FileName}", fileName);
                throw;
            }
        }

        private string BuildUrl(string objectName) {
            string cleanBaseUrl = _baseUrl.Trim('\"', ' ').TrimEnd('/');

            if (string.IsNullOrWhiteSpace(cleanBaseUrl)) {
                return $"/uploads/{objectName}";
            }

            // If it's a relative path (like /uploads), we assume it's already mapped to the bucket
            if (cleanBaseUrl.StartsWith("/")) {
                return $"{cleanBaseUrl}/{objectName}";
            }

            // If it starts with http, it's an absolute URL
            if (Uri.TryCreate(cleanBaseUrl, UriKind.Absolute, out Uri? absoluteUri)) {
                if (absoluteUri.IsLoopback || absoluteUri.Host.Equals("minio", StringComparison.OrdinalIgnoreCase)) {
                    return $"/uploads/{objectName}";
                }

                // If the base URL is a public origin, route through the uploads proxy.
                return $"{cleanBaseUrl}/uploads/{objectName}";
            }

            // Fallback: assume it's a hostname and use https
            return $"/uploads/{objectName}";
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
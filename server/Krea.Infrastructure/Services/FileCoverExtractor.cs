namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Files;
    using System.Linq;
    using TagLib;
    using VersOne.Epub;

    public sealed class FileCoverExtractor : IFileCoverExtractor {
        public async Task<ExtractedCoverResult?> TryExtractAsync(
            Stream fileStream,
            string fileName,
            string contentType,
            string type,
            CancellationToken cancellationToken) {
            if (!fileStream.CanSeek) {
                var buffered = new MemoryStream();
                await fileStream.CopyToAsync(buffered, cancellationToken);
                buffered.Position = 0;
                fileStream = buffered;
            }

            fileStream.Position = 0;

            return type.ToLowerInvariant() switch {
                "music" => await TryExtractMusicCoverAsync(fileStream, fileName, cancellationToken),
                "text" => await TryExtractTextCoverAsync(fileStream, fileName, cancellationToken),
                _ => null
            };
        }

        private static async Task<ExtractedCoverResult?> TryExtractMusicCoverAsync(
            Stream audioStream,
            string fileName,
            CancellationToken cancellationToken) {
            audioStream.Position = 0;

            string extension = Path.GetExtension(fileName);
            string tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try {
                await using (var tempFileStream = new FileStream(
                                 tempPath,
                                 FileMode.Create,
                                 FileAccess.Write,
                                 FileShare.None,
                                 bufferSize: 81920,
                                 useAsync: true)) {
                    await audioStream.CopyToAsync(tempFileStream, cancellationToken);
                    await tempFileStream.FlushAsync(cancellationToken);
                }

                using var tagFile = TagLib.File.Create(tempPath);

                IPicture? picture = tagFile.Tag.Pictures?.FirstOrDefault();
                if (picture is null || picture.Data is null || picture.Data.Count == 0)
                    return null;

                byte[] imageBytes = picture.Data.Data;
                string normalizedContentType = NormalizeContentType(picture.MimeType);
                string coverExtension = GetExtensionFromContentType(normalizedContentType);

                var memoryStream = new MemoryStream(imageBytes);
                memoryStream.Position = 0;

                string coverFileName = $"{Path.GetFileNameWithoutExtension(fileName)}-cover{coverExtension}";

                return new ExtractedCoverResult {
                    Stream = memoryStream,
                    FileName = coverFileName,
                    ContentType = normalizedContentType,
                    Size = imageBytes.LongLength
                };
            }
            catch (UnsupportedFormatException) {
                return null;
            }
            catch (CorruptFileException) {
                return null;
            }
            finally {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);

                if (audioStream.CanSeek)
                    audioStream.Position = 0;
            }
        }

        private static async Task<ExtractedCoverResult?> TryExtractTextCoverAsync(
            Stream fileStream,
            string fileName,
            CancellationToken cancellationToken) {
            string extension = Path.GetExtension(fileName).ToLowerInvariant();

            return extension switch {
                ".epub" => await TryExtractEpubCoverAsync(fileStream, fileName, cancellationToken),
                ".pdf" => null,
                ".txt" => null,
                _ => null
            };
        }

        private static async Task<ExtractedCoverResult?> TryExtractEpubCoverAsync(
            Stream epubStream,
            string fileName,
            CancellationToken cancellationToken) {
            epubStream.Position = 0;

            string extension = Path.GetExtension(fileName);
            string tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try {
                await using (var tempFileStream = new FileStream(
                                 tempPath,
                                 FileMode.Create,
                                 FileAccess.Write,
                                 FileShare.None,
                                 bufferSize: 81920,
                                 useAsync: true)) {
                    await epubStream.CopyToAsync(tempFileStream, cancellationToken);
                    await tempFileStream.FlushAsync(cancellationToken);
                }

                EpubBook book = await EpubReader.ReadBookAsync(tempPath);

                byte[]? coverBytes = TryGetEpubCoverBytes(book);

                if (coverBytes is null || coverBytes.Length == 0)
                    return null;

                string detectedContentType = DetectImageContentType(coverBytes);
                string coverExtension = GetExtensionFromContentType(detectedContentType);

                var memoryStream = new MemoryStream(coverBytes);
                memoryStream.Position = 0;

                string coverFileName = $"{Path.GetFileNameWithoutExtension(fileName)}-cover{coverExtension}";

                return new ExtractedCoverResult {
                    Stream = memoryStream,
                    FileName = coverFileName,
                    ContentType = detectedContentType,
                    Size = coverBytes.LongLength
                };
            }
            finally {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);

                if (epubStream.CanSeek)
                    epubStream.Position = 0;
            }
        }

        private static byte[]? TryGetEpubCoverBytes(EpubBook book)
        {
            // Camino principal: portada ya resuelta por la librería
            if (book.CoverImage is { Length: > 0 })
                return book.CoverImage;

            // Fallback: buscar una imagen "cover" en el contenido local
            if (book.Content?.Images?.Local is not null && book.Content.Images.Local.Count > 0)
            {
                var preferredCover = book.Content.Images.Local.FirstOrDefault(file =>
                    !string.IsNullOrWhiteSpace(file.Key) &&
                    !string.IsNullOrWhiteSpace(file.ContentMimeType) &&
                    file.ContentMimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) &&
                    file.Key.Contains("cover", StringComparison.OrdinalIgnoreCase) &&
                    file.Content is { Length: > 0 });

                if (preferredCover is not null)
                    return preferredCover.Content;

                var firstImage = book.Content.Images.Local.FirstOrDefault(file =>
                    !string.IsNullOrWhiteSpace(file.ContentMimeType) &&
                    file.ContentMimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) &&
                    file.Content is { Length: > 0 });

                if (firstImage is not null)
                    return firstImage.Content;
            }

            return null;
        }

        private static string NormalizeContentType(string? mimeType) {
            if (string.IsNullOrWhiteSpace(mimeType))
                return "image/jpeg";

            mimeType = mimeType.ToLowerInvariant();

            return mimeType switch {
                "image/jpg" => "image/jpeg",
                "image/jpeg" => "image/jpeg",
                "image/png" => "image/png",
                "image/webp" => "image/webp",
                _ => "image/jpeg"
            };
        }

        private static string GetExtensionFromContentType(string contentType) {
            return contentType.ToLowerInvariant() switch {
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg"
            };
        }

        private static string DetectImageContentType(byte[] bytes) {
            if (bytes.Length >= 8 &&
                bytes[0] == 0x89 &&
                bytes[1] == 0x50 &&
                bytes[2] == 0x4E &&
                bytes[3] == 0x47) {
                return "image/png";
            }

            if (bytes.Length >= 3 &&
                bytes[0] == 0xFF &&
                bytes[1] == 0xD8 &&
                bytes[2] == 0xFF) {
                return "image/jpeg";
            }

            if (bytes.Length >= 12 &&
                bytes[0] == 0x52 &&
                bytes[1] == 0x49 &&
                bytes[2] == 0x46 &&
                bytes[3] == 0x46 &&
                bytes[8] == 0x57 &&
                bytes[9] == 0x45 &&
                bytes[10] == 0x42 &&
                bytes[11] == 0x50) {
                return "image/webp";
            }

            return "image/jpeg";
        }
    }
}
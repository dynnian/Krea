namespace Krea.API.Tests.TestSupport {
    using Application.Abstractions;
    using Application.Features.PostUploads;
    using System.Text;

    public sealed class FakeFileMetadataReader : IFileMetadataReader {
        public async Task<ParsedUploadMetadata> ReadAsync(
            Stream stream,
            string fileName,
            string contentType,
            string type,
            CancellationToken cancellationToken) {
            string normalizedType = type.Trim().ToLowerInvariant();

            if (normalizedType == "image") {
                return new ParsedUploadMetadata {
                    Width = 1920, Height = 1080, FileSize = stream.Length, Format = "png"
                };
            }

            if (normalizedType == "music") {
                return new ParsedUploadMetadata { BitrateKbps = 320, DurationSec = 120 };
            }

            if (normalizedType == "text") {
                int wordCount = await CountWordsAsync(stream, cancellationToken);
                return new ParsedUploadMetadata { WordCount = wordCount };
            }

            throw new ArgumentException($"Unsupported type: {type}");
        }

        private static async Task<int> CountWordsAsync(Stream stream, CancellationToken cancellationToken) {
            if (stream.CanSeek) {
                stream.Position = 0;
            }

            using var reader = new StreamReader(stream, Encoding.UTF8, true, 1024, true);
            string content = await reader.ReadToEndAsync(cancellationToken);

            if (stream.CanSeek) {
                stream.Position = 0;
            }

            return content.Split((char[])null!, StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}
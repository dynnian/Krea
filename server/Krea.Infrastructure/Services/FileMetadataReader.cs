namespace Krea.Infrastructure.Services {
    using Application.Abstractions;
    using Application.Features.PostUploads;
    using SixLabors.ImageSharp;
    using System.Text;
    using VersOne.Epub;
    using UglyToad.PdfPig;
    using TagLib;

    public sealed class FileMetadataReader : IFileMetadataReader {
        public async Task<ParsedUploadMetadata> ReadAsync(
            Stream stream,
            string fileName,
            string contentType,
            string type,
            CancellationToken cancellationToken) {
            if (!stream.CanSeek) {
                var buffered = new MemoryStream();
                await stream.CopyToAsync(buffered, cancellationToken);
                buffered.Position = 0;
                stream = buffered;
            }

            stream.Position = 0;

            return type.ToLowerInvariant() switch {
                "image" => await ReadImageAsync(stream, fileName, cancellationToken),
                "music" => await ReadMusicAsync(stream, fileName, cancellationToken),
                "text" => await ReadTextAsync(stream, fileName, cancellationToken),
                _ => throw new InvalidOperationException("Unsupported file type.")
            };
        }

        private static async Task<ParsedUploadMetadata> ReadImageAsync(
            Stream stream,
            string fileName,
            CancellationToken cancellationToken) {
            stream.Position = 0;

            using Image image = await Image.LoadAsync(stream, cancellationToken);

            string extension = Path.GetExtension(fileName).ToLowerInvariant();

            return new ParsedUploadMetadata {
                Width = image.Width, 
                Height = image.Height, 
                FileSize = stream.Length, 
                Format = extension
            };
        }

        private static async Task<ParsedUploadMetadata> ReadMusicAsync(
            Stream stream,
            string fileName,
            CancellationToken cancellationToken) {
            if (!stream.CanSeek) {
                var buffered = new MemoryStream();
                await stream.CopyToAsync(buffered, cancellationToken);
                buffered.Position = 0;
                stream = buffered;
            }

            stream.Position = 0;

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
                    await stream.CopyToAsync(tempFileStream, cancellationToken);
                    await tempFileStream.FlushAsync(cancellationToken);
                }

                using var tagFile = TagLib.File.Create(tempPath);

                int durationSec = (int)Math.Ceiling(tagFile.Properties.Duration.TotalSeconds);
                int bitrateKbps = tagFile.Properties.AudioBitrate;

                if (durationSec <= 0)
                    throw new InvalidOperationException("Could not extract a valid audio duration.");

                if (bitrateKbps <= 0)
                    throw new InvalidOperationException("Could not extract a valid audio bitrate.");

                return new ParsedUploadMetadata { DurationSec = durationSec, BitrateKbps = bitrateKbps };
            }
            catch (UnsupportedFormatException ex) {
                throw new InvalidOperationException(
                    "The audio format is not supported for metadata extraction.", ex);
            }
            catch (CorruptFileException ex) {
                throw new InvalidOperationException(
                    "The audio file is corrupted or invalid.", ex);
            }
            finally {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);

                if (stream.CanSeek)
                    stream.Position = 0;
            }
        }

        private static async Task<ParsedUploadMetadata> ReadTextAsync(
            Stream stream,
            string fileName,
            CancellationToken cancellationToken) {
            string extension = Path.GetExtension(fileName).ToLowerInvariant();

            string text = extension switch {
                ".txt" => await ReadPlainTextAsync(stream),
                ".pdf" => await ReadPdfTextAsync(stream, fileName, cancellationToken),
                ".epub" => await ReadEpubTextAsync(stream, fileName, cancellationToken),
                _ => throw new InvalidOperationException(
                    $"Text metadata parser not implemented for extension '{extension}'.")
            };

            int wordCount = CountWords(text);

            return new ParsedUploadMetadata { WordCount = wordCount };
        }

        private static async Task<string> ReadPlainTextAsync(Stream stream) {
            stream.Position = 0;

            using var reader = new StreamReader(
                stream,
                Encoding.UTF8,
                detectEncodingFromByteOrderMarks: true,
                leaveOpen: true);

            string content = await reader.ReadToEndAsync();

            stream.Position = 0;
            return content;
        }

        private static async Task<string> ReadPdfTextAsync(
            Stream stream,
            string fileName,
            CancellationToken cancellationToken) {
            string tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{Path.GetExtension(fileName)}");

            try {
                stream.Position = 0;

                await using (var tempFileStream = new FileStream(
                                 tempPath,
                                 FileMode.Create,
                                 FileAccess.Write,
                                 FileShare.None,
                                 bufferSize: 81920,
                                 useAsync: true)) {
                    await stream.CopyToAsync(tempFileStream, cancellationToken);
                    await tempFileStream.FlushAsync(cancellationToken);
                }

                var builder = new StringBuilder();

                using (var document = PdfDocument.Open(tempPath)) {
                    foreach (var page in document.GetPages()) {
                        builder.Append(' ');
                        builder.Append(page.Text);
                    }
                }

                return builder.ToString();
            }
            finally {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);

                if (stream.CanSeek)
                    stream.Position = 0;
            }
        }

        private static async Task<string> ReadEpubTextAsync(
            Stream stream,
            string fileName,
            CancellationToken cancellationToken) {
            string tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{Path.GetExtension(fileName)}");

            try {
                stream.Position = 0;

                await using (var tempFileStream = new FileStream(
                                 tempPath,
                                 FileMode.Create,
                                 FileAccess.Write,
                                 FileShare.None,
                                 bufferSize: 81920,
                                 useAsync: true)) {
                    await stream.CopyToAsync(tempFileStream);
                    await tempFileStream.FlushAsync();
                }

                EpubBook book = await EpubReader.ReadBookAsync(tempPath);

                var builder = new StringBuilder();

                foreach (var textFile in book.ReadingOrder) {
                    if (!string.IsNullOrWhiteSpace(textFile.Content)) {
                        builder.Append(' ');
                        builder.Append(textFile.Content);
                    }
                }

                return StripHtml(builder.ToString());
            }
            finally {
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);

                if (stream.CanSeek)
                    stream.Position = 0;
            }
        }

        private static string StripHtml(string input) {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            return System.Text.RegularExpressions.Regex.Replace(input, "<.*?>", " ");
        }

        private static int CountWords(string text) {
            if (string.IsNullOrWhiteSpace(text))
                return 0;

            return text
                .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)
                .Length;
        }
    }
}
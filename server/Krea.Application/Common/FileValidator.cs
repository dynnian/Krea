namespace Krea.Application.Common {
    using System.ComponentModel.DataAnnotations;

    public static class FileValidator
    {
        private static readonly Dictionary<string, Rule> Rules = new()
        {
            ["image"] = new Rule(
                5 * 1024 * 1024,
                new[] { "image/png", "image/jpeg", "image/webp" },
                new[] { ".png", ".jpg", ".jpeg", ".webp" }
            ),

            ["music"] = new Rule(
                20 * 1024 * 1024,
                new[] { "music/mpeg", "music/wav" },
                new[] { ".mp3", ".wav" }
            ),

            ["text"] = new Rule(
                15 * 1024 * 1024,
                new[] { "application/pdf", "text/plain", "application/epub+zip" },
                new[] { ".pdf", ".txt", ".epub" } 
            )
        };

        public static void Validate(
            string type,
            string fileName,
            string contentType,
            long size)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                throw new ValidationException("File name is required");

            if (size <= 0)
                throw new ValidationException("File is empty");

            if (!Rules.TryGetValue(type, out var rule))
                throw new ValidationException($"Unsupported file category: {type}");

            if (!rule.AllowedContentTypes.Contains(contentType))
                throw new ValidationException($"Invalid content type: {contentType}");

            if (size > rule.MaxSize)
                throw new ValidationException(
                    $"File exceeds max size of {rule.MaxSize / (1024 * 1024)} MB");

            var extension = Path.GetExtension(fileName).ToLowerInvariant();

            if (!rule.AllowedExtensions.Contains(extension))
                throw new ValidationException($"Invalid file extension: {extension}");
        }

        private sealed record Rule(
            long MaxSize,
            string[] AllowedContentTypes,
            string[] AllowedExtensions);
    }
}

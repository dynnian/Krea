namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Metadata;
    using Application.Features.PostUploads.Dto;

    public class MetadataExtractor : IMetadataExtractor
    {
        private readonly AudioMetadataExtractor _audio;
        private readonly EpubMetadataExtractor _epub;

        public MetadataExtractor()
        {
            _audio = new AudioMetadataExtractor();
            _epub = new EpubMetadataExtractor();
        }

        public async Task<ExtractedMetadata> ExtractAsync(
            Stream fileStream,
            string contentType,
            string fileName,
            CancellationToken cancellationToken)
        {
            fileStream.Position = 0;

            if (contentType.StartsWith("audio"))
            {
                return _audio.Extract(fileStream, fileName);
            }

            if (fileName.EndsWith(".epub"))
            {
                return await _epub.ExtractAsync(fileStream);
            }

            return new ExtractedMetadata();
        }
    }
}
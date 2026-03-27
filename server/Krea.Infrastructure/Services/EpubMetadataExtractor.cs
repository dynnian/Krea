namespace Krea.Infrastructure.Services {
    using Application.Features.PostUploads.Dto;
    using VersOne.Epub;

    public class EpubMetadataExtractor {
        public async Task<ExtractedMetadata> ExtractAsync(Stream stream) {
            var book = await EpubReader.ReadBookAsync(stream);

            var language = book.Schema?
                .Package?
                .Metadata?
                .Languages?
                .FirstOrDefault();

            return new ExtractedMetadata
            {
                Title = book.Title,
                Description = book.Description,
                CoverImage = book.CoverImage,
                Language = language?.Language
            };
        }
    }
}
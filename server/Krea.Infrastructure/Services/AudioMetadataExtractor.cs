namespace Krea.Infrastructure.Services {
    using Application.Features.PostUploads.Dto;
    using Setup;
    using TagLib;

    public class AudioMetadataExtractor
    {
        public ExtractedMetadata Extract(Stream stream, string fileName)
        {
            using var tempStream = new MemoryStream();
            stream.CopyTo(tempStream);
            tempStream.Position = 0;

            var abstraction = new StreamFileAbstraction(fileName, tempStream, tempStream);
            var file = TagLib.File.Create(abstraction);

            var metadata = new ExtractedMetadata
            {
                DurationSec = (int)file.Properties.Duration.TotalSeconds,
                BitrateKbps = file.Properties.AudioBitrate,
                Title = file.Tag.Title
            };

            if (file.Tag.Pictures.Length > 0)
            {
                metadata.CoverImage = file.Tag.Pictures[0].Data.Data;
            }

            return metadata;
        }
    }
}
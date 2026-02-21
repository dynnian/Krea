using System.ComponentModel.DataAnnotations;
using Microsoft.VisualBasic;

namespace Krea.Domain.Entities {
    public sealed class MusicMetadata : Metadata
    {
        public int BitrateKbps { get; private set; }
        
        public int DurationSec { get; private set; }
        
        #pragma warning disable CS8618
        private MusicMetadata() {}
        #pragma warning restore CS8618

        public MusicMetadata(
            Guid uploadId,
            string title,
            string? description,
            int bitrateKbps,
            int durationSec,
            IEnumerable<Genre>? genres = null)
            : base(uploadId, title, description, genres)
        {
            BitrateKbps = bitrateKbps;
            DurationSec = durationSec;
        }

        public MusicMetadata Load(
            Guid id,
            Guid uploadId,
            string title,
            string? description,
            int bitrateKbps,
            int durationSec,
            IEnumerable<Genre> genres)
        {
            var metadata = new MusicMetadata {
                Id = id,
                UploadId = uploadId,
                Title = title,
                Description = description,
                BitrateKbps = bitrateKbps,
                DurationSec = durationSec
                
            };

            metadata.SetGenres(genres);

            return metadata;
        }
        
        public void UpdateTechnicalData(int bitrateKbps, int durationSec)
        {
            if (bitrateKbps < 0 || durationSec < 0)
                throw new ArgumentException("Values cannot be negative.");
            
            BitrateKbps = bitrateKbps;
            DurationSec = durationSec;
        }
    }
}
namespace Krea.API.Contracts {
    using System.Text.Json;
    using System.Text.Json.Serialization;

    /// <summary>
    /// Partial profile update payload.
    /// Send only the fields that should change.
    /// </summary>
    [JsonConverter(typeof(PatchUserProfileRequestJsonConverter))]
    public sealed class PatchUserProfileRequest {
        /// <summary>
        /// New display name (max 32 chars).
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// New biography (max 256 chars). Use null to clear it.
        /// </summary>
        public string? Biography { get; set; }

        /// <summary>
        /// New language code (ISO two-letter, e.g. "en").
        /// </summary>
        public string? LanguageCode { get; set; }

        /// <summary>
        /// New IANA time zone identifier (e.g. "America/Sao_Paulo").
        /// </summary>
        public string? TimeZoneId { get; set; }

        /// <summary>
        /// Profile picture media ID. Use null to remove current profile picture.
        /// </summary>
        public Guid? ProfilePictureId { get; set; }

        /// <summary>
        /// Banner picture media ID. Use null to remove current banner picture.
        /// </summary>
        public Guid? BannerPictureId { get; set; }

        [JsonIgnore] internal bool DisplayNameIsSet { get; set; }

        [JsonIgnore] internal bool BiographyIsSet { get; set; }

        [JsonIgnore] internal bool LanguageCodeIsSet { get; set; }

        [JsonIgnore] internal bool TimeZoneIdIsSet { get; set; }

        [JsonIgnore] internal bool ProfilePictureIdIsSet { get; set; }

        [JsonIgnore] internal bool BannerPictureIdIsSet { get; set; }
    }

    internal sealed class PatchUserProfileRequestJsonConverter : JsonConverter<PatchUserProfileRequest> {
        public override PatchUserProfileRequest Read(ref Utf8JsonReader reader, Type typeToConvert,
                                                     JsonSerializerOptions options) {
            if (reader.TokenType != JsonTokenType.StartObject)
                throw new JsonException("PATCH payload must be a JSON object.");

            var request = new PatchUserProfileRequest();

            while (reader.Read()) {
                if (reader.TokenType == JsonTokenType.EndObject)
                    return request;

                if (reader.TokenType != JsonTokenType.PropertyName)
                    throw new JsonException("Invalid JSON payload.");

                string propertyName = reader.GetString() ?? string.Empty;

                if (!reader.Read())
                    throw new JsonException("Invalid JSON payload.");

                if (propertyName.Equals("displayName", StringComparison.OrdinalIgnoreCase)) {
                    request.DisplayNameIsSet = true;
                    request.DisplayName = ReadStringOrNull(ref reader, "displayName");
                    continue;
                }

                if (propertyName.Equals("biography", StringComparison.OrdinalIgnoreCase)) {
                    request.BiographyIsSet = true;
                    request.Biography = ReadStringOrNull(ref reader, "biography");
                    continue;
                }

                if (propertyName.Equals("languageCode", StringComparison.OrdinalIgnoreCase)) {
                    request.LanguageCodeIsSet = true;
                    request.LanguageCode = ReadStringOrNull(ref reader, "languageCode");
                    continue;
                }

                if (propertyName.Equals("timeZoneId", StringComparison.OrdinalIgnoreCase)) {
                    request.TimeZoneIdIsSet = true;
                    request.TimeZoneId = ReadStringOrNull(ref reader, "timeZoneId");
                    continue;
                }

                if (propertyName.Equals("profilePictureId", StringComparison.OrdinalIgnoreCase)) {
                    request.ProfilePictureIdIsSet = true;
                    request.ProfilePictureId = ReadGuidOrNull(ref reader, "profilePictureId");
                    continue;
                }

                if (propertyName.Equals("bannerPictureId", StringComparison.OrdinalIgnoreCase)) {
                    request.BannerPictureIdIsSet = true;
                    request.BannerPictureId = ReadGuidOrNull(ref reader, "bannerPictureId");
                    continue;
                }

                // Ignore unknown fields to keep PATCH forward-compatible.
                reader.Skip();
            }

            throw new JsonException("Invalid JSON payload.");
        }

        public override void Write(Utf8JsonWriter writer, PatchUserProfileRequest value,
                                   JsonSerializerOptions options) {
            writer.WriteStartObject();

            if (value.DisplayNameIsSet)
                WriteStringOrNull(writer, "displayName", value.DisplayName);

            if (value.BiographyIsSet)
                WriteStringOrNull(writer, "biography", value.Biography);

            if (value.LanguageCodeIsSet)
                WriteStringOrNull(writer, "languageCode", value.LanguageCode);

            if (value.TimeZoneIdIsSet)
                WriteStringOrNull(writer, "timeZoneId", value.TimeZoneId);

            if (value.ProfilePictureIdIsSet)
                WriteGuidOrNull(writer, "profilePictureId", value.ProfilePictureId);

            if (value.BannerPictureIdIsSet)
                WriteGuidOrNull(writer, "bannerPictureId", value.BannerPictureId);

            writer.WriteEndObject();
        }

        private static string? ReadStringOrNull(ref Utf8JsonReader reader, string propertyName) {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType != JsonTokenType.String)
                throw new JsonException($"'{propertyName}' must be a string or null.");

            return reader.GetString();
        }

        private static Guid? ReadGuidOrNull(ref Utf8JsonReader reader, string propertyName) {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType != JsonTokenType.String)
                throw new JsonException($"'{propertyName}' must be a GUID string or null.");

            string? rawValue = reader.GetString();
            if (!Guid.TryParse(rawValue, out Guid parsed))
                throw new JsonException($"'{propertyName}' must be a valid GUID.");

            return parsed;
        }

        private static void WriteStringOrNull(Utf8JsonWriter writer, string name, string? value) {
            if (value is null)
                writer.WriteNull(name);
            else
                writer.WriteString(name, value);
        }

        private static void WriteGuidOrNull(Utf8JsonWriter writer, string name, Guid? value) {
            if (!value.HasValue)
                writer.WriteNull(name);
            else
                writer.WriteString(name, value.Value);
        }
    }
}
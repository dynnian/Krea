namespace Krea.Infrastructure.Configuration {
    public sealed class EmailOptions {
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpUser { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;
        public bool UseSsl { get; set; } = true;
    }
}
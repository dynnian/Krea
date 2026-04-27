namespace Krea.Infrastructure.Configuration {
    public sealed class MinioOptions {
        public string Endpoint { get; set; } = "localhost:9000";
        public string AccessKey { get; set; } = "minioadmin";
        public string SecretKey { get; set; } = "minioadmin";
        public string BaseUrl { get; set; } = "/uploads";
        public bool UseSsl { get; set; }
        public string Bucket { get; set; } = "uploads";
    }
}
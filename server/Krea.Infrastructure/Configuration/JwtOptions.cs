namespace Krea.Infrastructure.Configuration {
    public sealed class JwtOptions {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = "KreaAPI";
        public string Audience { get; set; } = "KreaClient";
        public int AccessTokenHours { get; set; } = 2;
        public int RefreshTokenDays { get; set; } = 7;
    }
}

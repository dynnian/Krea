namespace Krea.API.Services {
    using Application.Abstractions.Url;

    public class ConfirmationUrlBuilder : IConfirmationUrlBuilder {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly LinkGenerator _linkGenerator;

        public ConfirmationUrlBuilder(IHttpContextAccessor httpContextAccessor, LinkGenerator linkGenerator) {
            _httpContextAccessor = httpContextAccessor;
            _linkGenerator = linkGenerator;
        }

        public string BuildEmailConfirmationLink(Guid userId, string token) {
            HttpContext? httpContext = _httpContextAccessor.HttpContext;
            string encodedToken = Uri.EscapeDataString(token);
            string? link = _linkGenerator.GetUriByAction(
                httpContext,
                "ConfirmEmail",
                "Auth",
                new { userId, token = encodedToken }
            );
            return link!;
        }
    }
}
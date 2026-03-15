namespace Krea.API.Services {
    using Application.Abstractions.Url;

    /// <summary>
    /// Builds confirmation URLs (e.g., email confirmation links) using the HTTP context and link generator.
    /// </summary>
    public class ConfirmationUrlBuilder : IConfirmationUrlBuilder
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly LinkGenerator _linkGenerator;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConfirmationUrlBuilder"/> class.
        /// </summary>
        /// <param name="httpContextAccessor">Provides access to the current HTTP context.</param>
        /// <param name="linkGenerator">Generates absolute URLs for named actions.</param>
        public ConfirmationUrlBuilder(IHttpContextAccessor httpContextAccessor, LinkGenerator linkGenerator)
        {
            _httpContextAccessor = httpContextAccessor;
            _linkGenerator = linkGenerator;
        }

        /// <summary>
        /// Builds an absolute URL for confirming a user's email address.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="token">The email confirmation token.</param>
        /// <returns>An absolute URL pointing to the email confirmation endpoint.</returns>
        public string BuildEmailConfirmationLink(Guid userId, string token)
        {
            HttpContext? httpContext = _httpContextAccessor.HttpContext;
            if  (httpContext == null)
                throw new NullReferenceException("HttpContext is null");
            string? link = _linkGenerator.GetUriByAction(
                httpContext,
                action: "ConfirmEmail",
                controller: "Auth",
                values: new { userId, token }
            );
            
            return link!;
        }
    }
}
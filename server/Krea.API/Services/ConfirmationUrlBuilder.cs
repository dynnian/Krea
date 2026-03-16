namespace Krea.API.Services {
    using Application.Abstractions.Url;
    using Controllers;

    /// <summary>
    /// Builds absolute URLs for email confirmation links.
    /// </summary>
    /// <remarks>
    /// This service uses <see cref="IHttpContextAccessor"/> to obtain the current HTTP context
    /// and <see cref="LinkGenerator"/> to generate an absolute URL pointing to the
    /// <see cref="AuthController.ConfirmEmail"/> action.
    /// </remarks>
    public class ConfirmationUrlBuilder : IConfirmationUrlBuilder
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly LinkGenerator _linkGenerator;
        
        /// <summary>
        /// Initializes a new instance of the <see cref="ConfirmationUrlBuilder"/> class.
        /// </summary>
        /// <param name="httpContextAccessor">Accessor for the current HTTP context.</param>
        /// <param name="linkGenerator">Generator for creating absolute URLs.</param>
        public ConfirmationUrlBuilder(IHttpContextAccessor httpContextAccessor, LinkGenerator linkGenerator)
        {
            _httpContextAccessor = httpContextAccessor;
            _linkGenerator = linkGenerator;
        }
        
        /// <summary>
        /// Builds an absolute URL for email confirmation.
        /// </summary>
        /// <param name="userId">The ID of the user to confirm.</param>
        /// <param name="token">The email confirmation token (should be URL-encoded by the framework).</param>
        /// <returns>
        /// An absolute URL pointing to the <c>GET api/auth/confirm-email</c> endpoint with the provided userId and token as query parameters.
        /// </returns>
        /// <remarks>
        /// The returned URL is expected to be used in the email body. The token is passed as-is and will be automatically
        /// URL-encoded by the <see cref="LinkGenerator"/>. The generated URL includes the scheme, host, and path from the current request.
        /// </remarks>
        public string BuildEmailConfirmationLink(Guid userId, string token)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) throw new NullReferenceException("HttpContext is null");
            var link = _linkGenerator.GetUriByAction(
                httpContext,
                action: "ConfirmEmail",
                controller: "Auth",
                values: new { userId, token }
            );
            return link!;

        }
    }
}
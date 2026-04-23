namespace Krea.API.Tests.TestSupport {
    using System.Security.Claims;
    using System.Text.Encodings.Web;
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Microsoft.Extensions.Primitives;

    public sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions> {
        public const string HeaderName = "X-Test-Auth";
        public const string UserIdHeaderName = "X-Test-UserId";
        public const string UserNameHeaderName = "X-Test-Username";

        public TestAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync() {
            if (!Request.Headers.TryGetValue(HeaderName, out StringValues headerValue)) {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            string mode = headerValue.ToString().Trim().ToLowerInvariant();
            string role = mode == "admin" ? "Admin" : "Artist";
            string userName = Request.Headers.TryGetValue(UserNameHeaderName, out StringValues userNameHeader)
                ? userNameHeader.ToString()
                : "test-user";

            var userId = Guid.NewGuid();
            if (Request.Headers.TryGetValue(UserIdHeaderName, out StringValues userIdHeader) &&
                Guid.TryParse(userIdHeader.ToString(), out Guid parsedUserId)) {
                userId = parsedUserId;
            }

            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()), new Claim(ClaimTypes.Name, userName),
                new Claim(ClaimTypes.Role, role)
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
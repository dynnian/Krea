using Krea.Application.Abstractions.Auth;
using System.Security.Claims;

namespace Krea.API.Services {
    /// <summary>
    /// Provides access to the currently authenticated user's information.
    /// </summary>
    public class CurrentUserService : ICurrentUserService {
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Initializes a new instance of the <see cref="CurrentUserService"/> class.
        /// </summary>
        /// <param name="httpContextAccessor">Provides access to the current HTTP context.</param>
        public CurrentUserService(IHttpContextAccessor httpContextAccessor) =>
            _httpContextAccessor = httpContextAccessor;

        /// <summary>
        /// Gets the unique identifier of the currently authenticated user.
        /// Returns <see cref="Guid.Empty"/> if the user is not authenticated.
        /// </summary>
        public Guid UserId {
            get {
                Claim? claim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
                return claim != null && Guid.TryParse(claim.Value, out Guid id) ? id : Guid.Empty;
            }
        }

        /// <summary>
        /// Gets a value indicating whether the current request is from an authenticated user.
        /// </summary>
        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
    }
}
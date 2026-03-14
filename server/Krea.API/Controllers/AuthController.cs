namespace Krea.API.Controllers {
    using Domain.Abstractions;
    using Application.Features.Auth;
    using Application.Features.Auth.Login;
    using Application.Features.Auth.Register;
    using Application.Features.Auth.ConfirmEmail;
    using Application.Features.Auth.Refresh;
    using Application.Features.Auth.RevokeToken;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Application.Features.Auth.ChangePassword;
    using System.Security.Claims;

    /// <summary>
    /// Handles authentication operations such as registration, login, email confirmation,
    /// token refresh, logout, and password change.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ISender sender) : ControllerBase {
        /// <summary>
        /// Registers a new user account.
        /// </summary>
        /// <param name="command">The registration command containing user details (username, email, password, display name, language, time zone).</param>
        /// <returns>
        /// Returns an OK response with the new access token, expiration, and user data on success.
        /// The refresh token is automatically stored in an HTTP-only cookie.
        /// Returns a BadRequest with an error message if registration fails (e.g., duplicate username/email).
        /// </returns>
        /// <remarks>
        /// After successful registration, a confirmation email is sent to the user (if email service is configured).
        /// The refresh token is set as an HTTP-only cookie.
        /// </remarks>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Register(RegisterCommand command) {
            try {
                AuthResponse response = await sender.Send(command);

                Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions {
                    HttpOnly = true,
                    //Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                return Ok(new { token = response.Token, expiration = response.Expiration, user = response.User });
            }
            catch (Exception ex) {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Authenticates a user and issues access and refresh tokens.
        /// </summary>
        /// <param name="query">The login query containing the user's email/username and password.</param>
        /// <returns>
        /// Returns an OK response with the access token, expiration, and user data on success.
        /// The refresh token is automatically stored in an HTTP-only cookie.
        /// Returns Unauthorized with an error message if credentials are invalid or email is not confirmed.
        /// </returns>
        /// <remarks>
        /// The refresh token is set as an HTTP-only cookie (secure in production) and is used by the <see cref="RefreshToken"/> endpoint to obtain new access tokens.
        /// </remarks>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Login(LoginQuery query) {
            try {
                AuthResponse response = await sender.Send(query);

                // HttpOnly cookie with refresh token
                Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions {
                    HttpOnly = true,
                    //Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                // Return Access Token and user data
                return Ok(new { token = response.Token, expiration = response.Expiration, user = response.User });
            }
            catch (Exception ex) {
                return Unauthorized(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Confirms a user's email address using the token sent via email.
        /// </summary>
        /// <param name="userId">The ID of the user to confirm.</param>
        /// <param name="token">The email confirmation token (from the confirmation link).</param>
        /// <returns>
        /// Returns OK with a success message if the email was confirmed.
        /// Returns BadRequest with an error message if the token is invalid or the user does not exist.
        /// </returns>
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] Guid userId, [FromQuery] string token) {
            try {
                var command = new ConfirmEmailCommand(userId, token);
                bool result = await sender.Send(command);
                if (result)
                    return Ok("Email confirmed successfully.");
                return BadRequest("Email confirmation failed.");
            }
            catch (Exception ex) {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Refreshes an expired access token using a valid refresh token.
        /// </summary>
        /// <remarks>
        /// The refresh token is read from the HTTP-only cookie named "refreshToken".
        /// On success, a new access token and a new refresh token (rotation) are issued;
        /// the new refresh token is stored in the same cookie.
        /// </remarks>
        /// <returns>
        /// Returns an OK response with the new access token, expiration, and user data.
        /// Returns Unauthorized with an error message if the refresh token is missing, invalid, or expired.
        /// </returns>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> RefreshToken() {
            try {
                if (!Request.Cookies.TryGetValue("refreshToken", out string? refreshToken))
                    return Unauthorized(new { error = "No refresh token" });

                var command = new RefreshTokenCommand(refreshToken);
                AuthResponse? response = await sender.Send(command);
                if (response == null)
                    return Unauthorized(new { error = "Invalid refresh token" });

                Response.Cookies.Append("refreshToken", response.RefreshToken,
                    new CookieOptions {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddDays(7)
                    });

                return Ok(new { token = response.Token, expiration = response.Expiration, user = response.User });
            }
            catch (Exception ex) {
                return Unauthorized(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Revokes the current refresh token, effectively logging the user out.
        /// </summary>
        /// <remarks>
        /// The refresh token is read from the cookie and invalidated in the database.
        /// The cookie is then deleted.
        /// This endpoint requires authentication (valid access token).
        /// </remarks>
        /// <returns>
        /// Returns OK if the token was revoked (or no token was present).
        /// Returns BadRequest with an error message if revocation fails.
        /// </returns>
        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken() {
            try {
                if (!Request.Cookies.TryGetValue("refreshToken", out string? refreshToken))
                    return Ok(); // No token to revoke

                var command = new RevokeTokenCommand(refreshToken);
                await sender.Send(command);

                Response.Cookies.Delete("refreshToken");
                return Ok();
            }
            catch (Exception ex) {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Changes the password for the authenticated user.
        /// </summary>
        /// <param name="command">The command containing the user ID, current password, and new password.</param>
        /// <returns>
        /// Returns OK if the password was changed successfully.
        /// Returns Unauthorized if the user ID in the command does not match the authenticated user.
        /// Returns BadRequest if the password change fails (e.g., current password is incorrect).
        /// </returns>
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand command) {
            Guid userId = GetCurrentUserId();
            if (command.UserId != userId)
                return Unauthorized();

            bool result = await sender.Send(command);
            if (result)
                return Ok();
            return BadRequest("Password change failed");
        }

        private Guid GetCurrentUserId() {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId)) {
                throw new UnauthorizedAccessException("User ID not found in claims.");
            }

            return userId;
        }
    }
}
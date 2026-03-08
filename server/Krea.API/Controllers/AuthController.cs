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

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ISender sender) : ControllerBase {
        
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Register(RegisterCommand command)
        {
            try
            {
                AuthResponse response = await sender.Send(command);
                
                Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    //Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                return Ok(new
                {
                    token = response.Token,
                    expiration = response.Expiration,
                    user = response.User
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Login(LoginQuery query) 
        {
            try
            {
                AuthResponse? response = await sender.Send(query);

                // HttpOnly cookie with refresh token
                Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    //Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                // Return Access Token and user data
                return Ok(new
                {
                    token = response.Token,
                    expiration = response.Expiration,
                    user = response.User
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }
        
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
        
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> RefreshToken()
        {
            try
            {
                if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
                    return Unauthorized(new { error = "No refresh token" });

                var command = new RefreshTokenCommand(refreshToken);
                AuthResponse? response = await sender.Send(command);
                if (response == null)
                    return Unauthorized(new { error = "Invalid refresh token" });
                
                Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                return Ok(new
                {
                    token = response.Token,
                    expiration = response.Expiration,
                    user = response.User
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken()
        {
            try
            {
                if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
                    return Ok(); // No token to revoke

                var command = new RevokeTokenCommand(refreshToken);
                await sender.Send(command);

                Response.Cookies.Delete("refreshToken");
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand command)
        {
            var userId = GetCurrentUserId();
            if (command.UserId != userId)
                return Unauthorized();

            bool result = await sender.Send(command);
            if (result)
                return Ok();
            return BadRequest("Password change failed");
        }
        
        private Guid GetCurrentUserId()
        {
            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                throw new UnauthorizedAccessException("User ID not found in claims.");
            }
            return userId;
        }
    }
}
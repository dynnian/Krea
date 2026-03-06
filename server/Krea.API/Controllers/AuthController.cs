namespace Krea.API.Controllers {
    using Domain.Abstractions;
    using Application.Features.Auth;
    using Application.Features.Auth.Login;
    using Application.Features.Auth.Register;
    using Application.Features.Auth.ConfirmEmail;
    using Application.Features.Auth.ChangePassword;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ISender sender) : ControllerBase {
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterCommand command) {
            try {
                AuthResponse response = await sender.Send(command);
                return Ok(response);
            }
            catch (Exception ex) {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginQuery query) {
            try {
                AuthResponse response = await sender.Send(query);
                return Ok(response);
            }
            catch (Exception ex) {
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
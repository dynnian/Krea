using Krea.Application.Features.Auth;
using Krea.Application.Features.Auth.Login;
using Krea.Application.Features.Auth.Register;
using Krea.Domain.Abstractions;
using Microsoft.AspNetCore.Mvc;

namespace Krea.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterCommand command)
    {
        try
        {
            var response = await _sender.Send(command);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginQuery query)
    {
        try
        {
            var response = await _sender.Send(query);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
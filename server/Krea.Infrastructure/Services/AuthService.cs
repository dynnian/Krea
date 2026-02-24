using Krea.Application.Features.Auth;
using Krea.Application.Features.User;
using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Krea.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;

    public AuthService(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IConfiguration configuration,
        IUserRepository userRepository)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _userRepository = userRepository;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByNameAsync(request.Username);
        if (existingUser != null)
            throw new Exception("Username already taken.");

        existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new Exception("Email already registered.");

        // Crear domain user
        var domainUser = new User(
            request.Username,
            request.Email,
            "", // Identity lo maneja, posible cambio a db
            request.DisplayName,
            request.LanguageCode,
            request.TimeZoneId,
            request.Biography);

        // Crear AppUser
        var appUser = new AppUser
        {
            Id = domainUser.Id,
            UserName = request.Username,
            Email = request.Email
        };
        
        var result = await _userManager.CreateAsync(appUser, request.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));


        await _userRepository.AddAsync(domainUser);

        // Generar Token
        var token = await GenerateJwtToken(appUser, domainUser);

        return new AuthResponse(token.Token, token.Expiration, MapToDto(domainUser));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var appUser = await _userManager.FindByNameAsync(request.EmailOrUsername)
                      ?? await _userManager.FindByEmailAsync(request.EmailOrUsername);

        if (appUser == null)
            throw new Exception("Invalid credentials.");

        // Verificar contraseña
        var signInResult = await _signInManager.CheckPasswordSignInAsync(appUser, request.Password, false);
        if (!signInResult.Succeeded)
            throw new Exception("Invalid credentials.");

        // Cargar domain user
        var domainUser = await _userRepository.GetByIdAsync(appUser.Id);
        if (domainUser == null)
            throw new Exception("User not found in domain.");


        domainUser.SetLastLogin();
        await _userRepository.UpdateAsync(domainUser);

        // Generar token
        var token = await GenerateJwtToken(appUser, domainUser);

        return new AuthResponse(token.Token, token.Expiration, MapToDto(domainUser));
    }

    private async Task<(string Token, DateTime Expiration)> GenerateJwtToken(AppUser appUser, User domainUser)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, appUser.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, appUser.UserName!),
            new Claim(JwtRegisteredClaimNames.Email, appUser.Email!),
            new Claim("displayName", domainUser.DisplayName)
        };

        // Agregar roles de Identity
        var roles = await _userManager.GetRolesAsync(appUser);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddHours(2);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiration);
    }

    private UserDto MapToDto(User user) => new(
        user.Id,
        user.Username,
        user.Email,
        user.DisplayName,
        user.Biography,
        user.LanguageCode,
        user.TimeZoneId
    );
}
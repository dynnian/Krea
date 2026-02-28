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
using Krea.Domain.Abstractions;

namespace Krea.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    
    public AuthService(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IConfiguration configuration,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
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
        await _unitOfWork.SaveChangesAsync();

        var token = await GenerateJwtToken(appUser, domainUser);
        var userDto = await MapToDto(domainUser, appUser);

        return new AuthResponse(token.Token, token.Expiration, userDto);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var appUser = await _userManager.FindByNameAsync(request.EmailOrUsername)
                      ?? await _userManager.FindByEmailAsync(request.EmailOrUsername);

        if (appUser == null)
            throw new Exception("Invalid credentials.");

        var signInResult = await _signInManager.CheckPasswordSignInAsync(appUser, request.Password, false);
        if (!signInResult.Succeeded)
            throw new Exception("Invalid credentials.");

        var domainUser = await _userRepository.GetByIdAsync(appUser.Id);
        if (domainUser == null)
            throw new Exception("User not found in domain.");

        domainUser.SetLastLogin();
        await _userRepository.UpdateAsync(domainUser);
        await _unitOfWork.SaveChangesAsync();

        var token = await GenerateJwtToken(appUser, domainUser);
        var userDto = await MapToDto(domainUser, appUser);

        return new AuthResponse(token.Token, token.Expiration, userDto);
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

    private Task<UserDto> MapToDto(User domainUser, AppUser appUser)
    {
        return Task.FromResult(new UserDto(
            domainUser.Id,
            appUser.UserName ?? string.Empty,
            appUser.Email ?? string.Empty,
            domainUser.DisplayName,
            domainUser.Biography,
            domainUser.LanguageCode,
            domainUser.TimeZoneId
        ));
    }
}
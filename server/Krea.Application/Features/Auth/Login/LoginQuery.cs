using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Auth.Login;

public sealed record LoginQuery(
    string EmailOrUsername, 
    string Password
    ) : IRequest<AuthResponse>; 
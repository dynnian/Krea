using Krea.Domain.Abstractions;

namespace Krea.Application.Features.Auth.ConfirmEmail;

public record ConfirmEmailCommand(
    Guid UserId,
    string Token
) : IRequest<bool>;
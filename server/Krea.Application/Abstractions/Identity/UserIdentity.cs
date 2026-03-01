namespace Krea.Application.Abstractions.Identity {
    public record UserIdentity(
        Guid Id,
        string UserName,
        string Email,
        IList<string> Roles
    );
}
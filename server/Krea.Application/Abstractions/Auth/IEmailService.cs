namespace Krea.Application.Abstractions.Auth;

public interface IEmailService 
{
    Task SendConfirmationEmailAsync(string email, string userName, string confirmationLink);
}
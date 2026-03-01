namespace Krea.Application.Abstractions.Email;

public interface IEmailService 
{
    Task SendConfirmationEmailAsync(string email, string userName, string confirmationLink);
}
using Krea.Application.Abstractions.Email;
using Microsoft.Extensions.Logging;

namespace Krea.Infrastructure.Services;

public class FakeEmailService : IEmailService
{
    private readonly ILogger<FakeEmailService> _logger;

    public FakeEmailService(ILogger<FakeEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendConfirmationEmailAsync(string email, string userName, string confirmationLink)
    {
        _logger.LogInformation("[FAKE EMAIL] To: {Email}, User: {UserName}, Link: {ConfirmationLink}",
            email, userName, confirmationLink);
        return Task.CompletedTask;
    }
}
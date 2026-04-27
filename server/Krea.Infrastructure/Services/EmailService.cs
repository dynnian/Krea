using System.Net;
using System.Net.Mail;

namespace Krea.Infrastructure.Services {
    using Application.Abstractions.Email;
    using Configuration;
    using Microsoft.Extensions.Options;

    public class EmailService : IEmailService {
        private readonly EmailOptions _options;

        public EmailService(IOptions<EmailOptions> options) => _options = options.Value;

        public async Task SendConfirmationEmailAsync(string email, string userName, string confirmationLink) {
            string smtpHost = GetRequiredOptionValue(_options.SmtpHost, "Email:SmtpHost");
            string smtpUser = GetRequiredOptionValue(_options.SmtpUser, "Email:SmtpUser");
            string smtpPass = GetRequiredOptionValue(_options.SmtpPassword, "Email:SmtpPassword");
            string fromAddress = GetRequiredOptionValue(_options.FromAddress, "Email:FromAddress");

            if (_options.SmtpPort <= 0) {
                throw new InvalidOperationException("Email:SmtpPort must be greater than zero.");
            }

            using var client = new SmtpClient(smtpHost, _options.SmtpPort);
            client.Credentials = new NetworkCredential(smtpUser, smtpPass);
            client.EnableSsl = _options.UseSsl;

            var mailMessage = new MailMessage {
                From = new MailAddress(fromAddress),
                Subject = "Confirm your email",
                Body = $@"
                <h1>Welcome, {userName}!</h1>
                <p>Please confirm your email by clicking the link below:</p>
                <a href='{confirmationLink}'>Confirm Email</a>
                <p>If you did not register, ignore this email.</p>",
                IsBodyHtml = true
            };
            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
        }

        private static string GetRequiredOptionValue(string? value, string key) {
            if (string.IsNullOrWhiteSpace(value)) {
                throw new InvalidOperationException($"Missing required configuration value: {key}");
            }

            return value;
        }
    }
}
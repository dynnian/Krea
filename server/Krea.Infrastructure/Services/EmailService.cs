using Krea.Application.Abstractions.Auth;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Krea.Infrastructure.Services {
    public class EmailService : IEmailService {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration) => _configuration = configuration;

        public async Task SendConfirmationEmailAsync(string email, string userName, string confirmationLink) {
            string? smtpHost = _configuration["Email:SmtpHost"];
            int smtpPort = int.Parse(_configuration["Email:SmtpPort"]!);
            string? smtpUser = _configuration["Email:SmtpUser"];
            string? smtpPass = _configuration["Email:SmtpPassword"];
            string? fromAddress = _configuration["Email:FromAddress"];

            using var client = new SmtpClient(smtpHost, smtpPort);
            client.Credentials = new NetworkCredential(smtpUser, smtpPass);
            client.EnableSsl = true;

            var mailMessage = new MailMessage {
                From = new MailAddress(fromAddress ?? throw new InvalidOperationException()),
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
    }
}
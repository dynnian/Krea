using System.Net;
using System.Net.Http.Json;
using Krea.API.Controllers;
using Krea.API.Tests.TestSupport;
using Krea.Application.Abstractions.Payments;
using Krea.Application.Features.Donations.CreateDonation;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Krea.API.Tests.Integration {
    using Domain.Entities;
    using Domain.ValueObjects;

    public sealed class DonationFlowIntegrationTests : IAsyncLifetime {
        private IntegrationTestHost _host = null!;
        private TestDataSeeder.SeededUsers _seeded = null!;
        private TestStripePaymentGateway _testGateway = null!;

        public async Task InitializeAsync() {
            _testGateway = new TestStripePaymentGateway();

            _host = await IntegrationTestHost.CreateAsync(
                configureServices: services => {
                    // Replace real IPaymentGateway with test fake
                    services.AddSingleton<IPaymentGateway>(_testGateway);
                },
                seed: async sp => {
                    _seeded = await TestDataSeeder.SeedBasicUsersAsync(sp);
                });
        }

        public async Task DisposeAsync() => await _host.DisposeAsync();

        [Fact]
        public async Task CreateDonation_ValidRequest_ReturnsCheckoutUrlAndPersistsDonation() {
            var request = new CreateDonationRequest(
                _seeded.ArtistId,
                25.00m,
                "USD",
                "Integration test donation",
                "http://localhost/success",
                "http://localhost/cancel"
            );

            HttpResponseMessage response = await IntegrationTestHost.SendAuthenticatedAsync(
                _host.Client,
                HttpMethod.Post,
                "/api/Donations",
                _seeded.AdminId,
                "User",
                request
            );

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<CreateDonationResponse>();
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.DonationId);
            Assert.StartsWith("https://checkout.stripe.com/", result.CheckoutUrl);

            using IServiceScope scope = _host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Donation? donation = await db.Donations
                                         .Include(d => d.Payments)
                                         .Include(d => d.Donor)
                                         .Include(d => d.Recipient)
                                         .FirstOrDefaultAsync(d => d.Id == result.DonationId);

            Assert.NotNull(donation);
            Assert.Equal(_seeded.AdminId, donation.Donor.Id);
            Assert.Equal(_seeded.ArtistId, donation.Recipient.Id);
            Assert.Equal(25.00m, donation.Amount.Amount);
            Assert.Equal("USD", donation.Amount.Currency);
            Assert.Single(donation.Payments);

            Payment payment = donation.Payments.First();
            Assert.Equal(PaymentStatus.Pending, payment.Status);
            Assert.Equal("stripe", payment.ExternalRef.Provider);
            Assert.NotNull(payment.ExternalRef.Value);
        }

        [Fact]
        public async Task Webhook_CheckoutSessionCompleted_ConfirmsPayment() {
            var request = new CreateDonationRequest(
                _seeded.ArtistId,
                15.00m,
                "USD",
                "Webhook test",
                "http://localhost/success",
                "http://localhost/cancel"
            );

            HttpResponseMessage createResponse = await IntegrationTestHost.SendAuthenticatedAsync(
                _host.Client,
                HttpMethod.Post,
                "/api/Donations",
                _seeded.AdminId,
                "User",
                request
            );

            var createResult = await createResponse.Content.ReadFromJsonAsync<CreateDonationResponse>();
            Assert.NotNull(createResult);

            string? sessionId = _testGateway.LastSessionId;
            string webhookPayload = $$"""
                                      {
                                          "id": "evt_test",
                                          "type": "checkout.session.completed",
                                          "data": {
                                              "object": {
                                                  "id": "{{sessionId}}",
                                                  "object": "checkout.session"
                                              }
                                          }
                                      }
                                      """;

            var webhookRequest = new HttpRequestMessage(HttpMethod.Post, "/api/webhooks/stripe") {
                Content = new StringContent(webhookPayload, System.Text.Encoding.UTF8, "application/json")
            };
            webhookRequest.Headers.Add("Stripe-Signature", "dummy_signature");

            HttpResponseMessage webhookResponse = await _host.Client.SendAsync(webhookRequest);
            Assert.Equal(HttpStatusCode.OK, webhookResponse.StatusCode);

            using IServiceScope scope = _host.App.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Donation? donation = await db.Donations
                                         .Include(d => d.Payments)
                                         .FirstOrDefaultAsync(d => d.Id == createResult.DonationId);

            Assert.NotNull(donation);
            Payment payment = donation.Payments.First();
            Assert.Equal(PaymentStatus.Completed, payment.Status);
            Assert.NotNull(payment.PaidAt);
        }

        [Fact]
        public async Task Webhook_WithInvalidSignature_ReturnsBadRequest() {
            var webhookRequest = new HttpRequestMessage(HttpMethod.Post, "/api/webhooks/stripe") {
                Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json")
            };
            webhookRequest.Headers.Add("Stripe-Signature", "invalid");

            HttpResponseMessage response = await _host.Client.SendAsync(webhookRequest);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
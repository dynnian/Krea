using Krea.Application.Abstractions.Auth;
using Krea.Application.Abstractions.Payments;
using Krea.Application.Features.Donations.CreateDonation;
using Krea.Domain.Abstractions;
using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Krea.API.Tests.Unit.Handlers {
    public sealed class CreateDonationCommandHandlerTests {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IDonationRepository> _donationRepoMock;
        private readonly Mock<IPaymentGateway> _paymentGatewayMock;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<ICurrentUserService> _currentUserMock;
        private readonly CreateDonationCommandHandler _handler;

        private readonly User _donor;
        private readonly User _recipient;
        private readonly CreateDonationCommand _validCommand;

        public CreateDonationCommandHandlerTests() {
            _userRepoMock = new Mock<IUserRepository>();
            _donationRepoMock = new Mock<IDonationRepository>();
            _paymentGatewayMock = new Mock<IPaymentGateway>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _currentUserMock = new Mock<ICurrentUserService>();
            var loggerMock = new Mock<ILogger<CreateDonationCommandHandler>>();

            _handler = new CreateDonationCommandHandler(
                _userRepoMock.Object,
                _donationRepoMock.Object,
                _paymentGatewayMock.Object,
                _unitOfWorkMock.Object,
                loggerMock.Object,
                _currentUserMock.Object
            );

            _donor = new User("Donor", "en", "UTC");
            _recipient = new User("Recipient", "en", "UTC");

            _validCommand = new CreateDonationCommand(
                _recipient.Id,
                25.00m,
                "USD",
                "Test message",
                "https://example.com/success",
                "https://example.com/cancel"
            );
        }

        [Fact]
        public async Task Handle_WithValidRequest_CreatesDonationAndReturnsResponse() {
            _currentUserMock.Setup(x => x.UserId).Returns(_donor.Id);
            _userRepoMock.Setup(x => x.GetByIdAsync(_donor.Id, It.IsAny<CancellationToken>()))
                         .ReturnsAsync(_donor);
            _userRepoMock.Setup(x => x.GetByIdAsync(_recipient.Id, It.IsAny<CancellationToken>()))
                         .ReturnsAsync(_recipient);

            var sessionResult = new CheckoutSessionResult("sess_123", "https://checkout.stripe.com/sess_123");
            _paymentGatewayMock.Setup(x => x.CreateCheckoutSessionAsync(
                                   _validCommand.Amount,
                                   _validCommand.Currency,
                                   _validCommand.SuccessUrl,
                                   _validCommand.CancelUrl))
                               .ReturnsAsync(sessionResult);

            Donation? capturedDonation = null;
            _donationRepoMock.Setup(x => x.Add(It.IsAny<Donation>()))
                             .Callback<Donation>(d => capturedDonation = d);

            CreateDonationResponse response = await _handler.Handle(_validCommand, CancellationToken.None);

            Assert.NotNull(response);
            Assert.Equal(sessionResult.Url, response.CheckoutUrl);
            Assert.NotEqual(Guid.Empty, response.DonationId);

            // Verify donation was created with correct data
            Assert.NotNull(capturedDonation);
            Assert.Equal(_donor, capturedDonation.Donor);
            Assert.Equal(_recipient, capturedDonation.Recipient);
            Assert.Equal(_validCommand.Amount, capturedDonation.Amount.Amount);
            Assert.Equal(_validCommand.Currency, capturedDonation.Amount.Currency);
            Assert.Equal(_validCommand.Message, capturedDonation.Message);

            // Verify payment was added
            Assert.Single(capturedDonation.Payments);
            Payment payment = capturedDonation.Payments.First();
            Assert.Equal(_donor, payment.Payer);
            Assert.Equal(_validCommand.Amount, payment.Amount.Amount);
            Assert.Equal(_validCommand.Currency, payment.Amount.Currency);
            Assert.Equal("stripe", payment.ExternalRef.Provider);
            Assert.Equal(sessionResult.SessionId, payment.ExternalRef.Value);
            Assert.Equal(PaymentStatus.Pending, payment.Status);

            // Verify unit of work saved
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_WhenCurrentUserNotFound_ThrowsUnauthorizedAccessException() {
            _currentUserMock.Setup(x => x.UserId).Returns(Guid.Empty);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _handler.Handle(_validCommand, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_WhenDonorNotFound_ThrowsException() {
            _currentUserMock.Setup(x => x.UserId).Returns(_donor.Id);
            _userRepoMock.Setup(x => x.GetByIdAsync(_donor.Id, It.IsAny<CancellationToken>()))
                         .ReturnsAsync((User?)null);

            var ex = await Assert.ThrowsAsync<Exception>(() =>
                _handler.Handle(_validCommand, CancellationToken.None));
            Assert.Equal("Donor not found.", ex.Message);
        }

        [Fact]
        public async Task Handle_WhenRecipientNotFound_ThrowsException() {
            _currentUserMock.Setup(x => x.UserId).Returns(_donor.Id);
            _userRepoMock.Setup(x => x.GetByIdAsync(_donor.Id, It.IsAny<CancellationToken>()))
                         .ReturnsAsync(_donor);
            _userRepoMock.Setup(x => x.GetByIdAsync(_recipient.Id, It.IsAny<CancellationToken>()))
                         .ReturnsAsync((User?)null);

            var ex = await Assert.ThrowsAsync<Exception>(() =>
                _handler.Handle(_validCommand, CancellationToken.None));
            Assert.Equal("Recipient not found.", ex.Message);
        }
    }
}
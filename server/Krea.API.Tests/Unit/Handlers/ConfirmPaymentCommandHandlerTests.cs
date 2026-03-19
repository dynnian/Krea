using Krea.Application.Abstractions.Payments;
using Krea.Application.Features.Payments.ConfirmPayment;
using Krea.Domain.Abstractions;
using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Krea.API.Tests.Unit.Handlers;

public sealed class ConfirmPaymentCommandHandlerTests
{
    private readonly Mock<IPaymentQueryService> _queryServiceMock;
    private readonly Mock<IDonationRepository> _donationRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<ConfirmPaymentCommandHandler>> _loggerMock;
    private readonly ConfirmPaymentCommandHandler _handler;

    private readonly ConfirmPaymentCommand _validCommand;
    private readonly ExternalPaymentRef _externalRef;
    private readonly Donation _donation;
    private readonly Payment _payment;
    private readonly PaymentParentInfo _parentInfo;

    public ConfirmPaymentCommandHandlerTests()
    {
        _queryServiceMock = new Mock<IPaymentQueryService>();
        _donationRepoMock = new Mock<IDonationRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<ConfirmPaymentCommandHandler>>();

        _handler = new ConfirmPaymentCommandHandler(
            _queryServiceMock.Object,
            Mock.Of<ICommissionRequestRepository>(),
            _donationRepoMock.Object,
            Mock.Of<ISubscriptionRepository>(),
            _unitOfWorkMock.Object,
            _loggerMock.Object
        );

        _validCommand = new ConfirmPaymentCommand("stripe", "sess_123");
        _externalRef = new ExternalPaymentRef("stripe", "sess_123");

        var donor = new User("Donor", "en", "UTC");
        var recipient = new User("Recipient", "en", "UTC");
        var amount = new Money(25, "USD");
        _donation = new Donation(donor, recipient, amount, null);
        _payment = _donation.CreatePayment(donor, amount, _externalRef);

        _parentInfo = new PaymentParentInfo(_donation.Id, PaymentParentType.Donation, _payment.Id);
    }

    [Fact]
    public async Task Handle_WithValidDonation_MarksPaymentCompletedAndSaves()
    {
        // Arrange
        _queryServiceMock.Setup(x => x.GetParentByExternalRefAsync(
                It.Is<ExternalPaymentRef>(r => r.Provider == _externalRef.Provider && r.Value == _externalRef.Value),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(_parentInfo);

        _donationRepoMock.Setup(x => x.GetByIdWithPaymentsAsync(_donation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_donation);

        // Act
        await _handler.Handle(_validCommand, CancellationToken.None);

        // Assert
        Assert.Equal(PaymentStatus.Completed, _payment.Status);
        Assert.NotNull(_payment.PaidAt);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenParentNotFound_LogsWarningAndReturns()
    {
        // Arrange
        _queryServiceMock.Setup(x => x.GetParentByExternalRefAsync(
                It.Is<ExternalPaymentRef>(r => r.Provider == _externalRef.Provider && r.Value == _externalRef.Value),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((PaymentParentInfo?)null);

        // Act
        var result = await _handler.Handle(_validCommand, CancellationToken.None);

        // Assert
        Assert.Equal(Krea.Domain.Abstractions.Unit.Value, result);
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("No parent found")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenDonationNotFound_ThrowsInvalidOperationException()
    {
        // Arrange
        _queryServiceMock.Setup(x => x.GetParentByExternalRefAsync(
                It.Is<ExternalPaymentRef>(r => r.Provider == _externalRef.Provider && r.Value == _externalRef.Value),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(_parentInfo);

        _donationRepoMock.Setup(x => x.GetByIdWithPaymentsAsync(_donation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Donation?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(_validCommand, CancellationToken.None));
        Assert.Equal("Donation not found.", exception.Message);
    }
}
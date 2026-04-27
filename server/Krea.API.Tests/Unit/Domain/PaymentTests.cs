using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Xunit;

namespace Krea.API.Tests.Unit.Domain {
    public sealed class PaymentTests {
        private readonly User _payer = new("Payer", "en", "UTC");
        private readonly User _recipient = new("Recipient", "en", "UTC");
        private readonly Money _amount = new(25);
        private readonly ExternalPaymentRef _externalRef = new("stripe", "sess_123");

        private Payment CreatePaymentThroughDonation() {
            var donation = new Donation(_payer, _recipient, _amount, null);
            return donation.CreatePayment(_payer, _amount, _externalRef);
        }

        [Fact]
        public void PaymentCreatedThroughAggregate_HasCorrectProperties() {
            Payment payment = CreatePaymentThroughDonation();

            Assert.NotEqual(Guid.Empty, payment.Id);
            Assert.Equal(_payer, payment.Payer);
            Assert.Equal(_amount, payment.Amount);
            Assert.Equal(_externalRef, payment.ExternalRef);
            Assert.Equal(_payer, payment.Payer);
            Assert.Equal(_amount, payment.Amount);
            Assert.Equal(_externalRef, payment.ExternalRef);
            Assert.Equal(PaymentStatus.Pending, payment.Status);
            Assert.Null(payment.PaidAt);
            Assert.Equal(PaymentType.Donation, payment.Type);
        }

        [Fact]
        public void MarkCompleted_SetsCompletedAndPaidAt() {
            Payment payment = CreatePaymentThroughDonation();

            payment.MarkCompleted();

            Assert.Equal(PaymentStatus.Completed, payment.Status);
            Assert.NotNull(payment.PaidAt);
        }

        [Fact]
        public void MarkCompleted_Throws_WhenNotPending() {
            Payment payment = CreatePaymentThroughDonation();
            payment.MarkCompleted();

            Assert.Throws<InvalidOperationException>(() => payment.MarkCompleted());
        }

        [Fact]
        public void MarkFailed_SetsFailed() {
            Payment payment = CreatePaymentThroughDonation();

            payment.MarkFailed();

            Assert.Equal(PaymentStatus.Failed, payment.Status);
            Assert.Null(payment.PaidAt);
        }

        [Fact]
        public void MarkFailed_Throws_WhenNotPending() {
            Payment payment = CreatePaymentThroughDonation();
            payment.MarkCompleted();

            Assert.Throws<InvalidOperationException>(() => payment.MarkFailed());
        }
    }
}
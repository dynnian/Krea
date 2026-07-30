using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Xunit;

namespace Krea.API.Tests.Unit.Domain {
    public sealed class DonationTests {
        private readonly User _donor = new("Donor", "en", "UTC");
        private readonly User _recipient = new("Recipient", "en", "UTC");
        private readonly Money _amount = new(25.00m);

        [Fact]
        public void Constructor_CreatesDonation_WithValidData() {
            var donation = new Donation(_donor, _recipient, _amount, "Test message");

            Assert.NotEqual(Guid.Empty, donation.Id);
            Assert.Equal(_donor, donation.Donor);
            Assert.Equal(_recipient, donation.Recipient);
            Assert.Equal(_amount, donation.Amount);
            Assert.Equal("Test message", donation.Message);
            Assert.Empty(donation.Payments);
            Assert.True(donation.DonatedAt <= DateTime.UtcNow);
        }

        [Fact]
        public void Constructor_Throws_WhenDonorNull() =>
            Assert.Throws<ArgumentNullException>(() => new Donation(null!, _recipient, _amount, "msg"));

        [Fact]
        public void Constructor_Throws_WhenRecipientNull() =>
            Assert.Throws<ArgumentNullException>(() => new Donation(_donor, null!, _amount, "msg"));

        [Fact]
        public void Constructor_Throws_WhenDonorEqualsRecipient() =>
            Assert.Throws<ArgumentException>(() => new Donation(_donor, _donor, _amount, "msg"));

        [Fact]
        public void Constructor_Throws_WhenAmountZero() {
            var zero = new Money(0);
            Assert.Throws<ArgumentException>(() => new Donation(_donor, _recipient, zero, "msg"));
        }

        [Fact]
        public void CreatePayment_AddsPayment_WhenValid() {
            var donation = new Donation(_donor, _recipient, _amount, null);
            var externalRef = new ExternalPaymentRef("stripe", "sess_123");

            Payment payment = donation.CreatePayment(_donor, _amount, externalRef);

            Assert.NotNull(payment);
            Assert.Single(donation.Payments);
            Assert.Equal(payment, donation.Payments.First());
        }

        [Fact]
        public void CreatePayment_Throws_WhenPayerNotDonor() {
            var donation = new Donation(_donor, _recipient, _amount, null);
            var otherUser = new User("Other", "en", "UTC");

            Assert.Throws<ArgumentException>(() =>
                donation.CreatePayment(otherUser, _amount, new ExternalPaymentRef("stripe", "sess_123")));
        }

        [Fact]
        public void CreatePayment_Throws_WhenAmountMismatch() {
            var donation = new Donation(_donor, _recipient, _amount, null);
            var differentAmount = new Money(30);

            Assert.Throws<ArgumentException>(() =>
                donation.CreatePayment(_donor, differentAmount, new ExternalPaymentRef("stripe", "sess_123")));
        }

        [Fact]
        public void CreatePayment_Throws_WhenPaymentAlreadyExists() {
            var donation = new Donation(_donor, _recipient, _amount, null);
            var externalRef = new ExternalPaymentRef("stripe", "sess_123");
            donation.CreatePayment(_donor, _amount, externalRef);

            Assert.Throws<InvalidOperationException>(() =>
                donation.CreatePayment(_donor, _amount, new ExternalPaymentRef("stripe", "sess_456")));
        }

        [Fact]
        public void ConfirmPayment_MarksPaymentCompleted_WhenFound() {
            var donation = new Donation(_donor, _recipient, _amount, null);
            Payment payment = donation.CreatePayment(_donor, _amount, new ExternalPaymentRef("stripe", "sess_123"));

            donation.ConfirmPayment(payment.Id);

            Assert.Equal(PaymentStatus.Completed, payment.Status);
            Assert.NotNull(payment.PaidAt);
        }

        [Fact]
        public void ConfirmPayment_Throws_WhenPaymentIdNotFound() {
            var donation = new Donation(_donor, _recipient, _amount, null);
            donation.CreatePayment(_donor, _amount, new ExternalPaymentRef("stripe", "sess_123"));

            Assert.Throws<InvalidOperationException>(() => donation.ConfirmPayment(Guid.NewGuid()));
        }
    }
}
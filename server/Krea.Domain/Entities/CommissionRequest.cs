using Krea.Domain.ValueObjects;

namespace Krea.Domain.Entities {
    public sealed class CommissionRequest {
        public Guid Id { get; private set; }
        public User Bidder { get; private set; }
        public CommissionOffering Offering { get; private set; }

        private readonly List<Payment> _payments = new();
        public IReadOnlyCollection<Payment> Payments => _payments;

        private readonly List<Submission> _submissions = new();
        public IReadOnlyCollection<Submission> Submissions => _submissions;

        public string Brief { get; private set; }

        public CommissionRequestStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

#pragma warning disable CS8618
        private CommissionRequest() { }
#pragma warning restore CS8618

        public CommissionRequest(User bidder, CommissionOffering offering, string brief) {
            Validate(bidder, offering, brief);

            Id = Guid.NewGuid();
            Bidder = bidder;
            Offering = offering;
            Brief = brief;
            Status = CommissionRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public static CommissionRequest Load(
            Guid id,
            User bidder,
            CommissionOffering offering,
            string brief,
            CommissionRequestStatus status,
            DateTime createdAt,
            DateTime updatedAt) {
            Validate(bidder, offering, brief);

            return new CommissionRequest {
                Id = id,
                Bidder = bidder,
                Offering = offering,
                Brief = brief,
                Status = status,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }

        // Create a payment associated with this commission
        public Payment CreatePayment(User payer, Money amount, ExternalPaymentRef externalRef) {
            if (!ReferenceEquals(payer, Bidder))
                throw new ArgumentException("Payer must be the bidder.");

            if (Status != CommissionRequestStatus.Accepted && Status != CommissionRequestStatus.InProgress) {
                throw new InvalidOperationException(
                    "Payments can only be created for accepted or in-progress commissions.");
            }

            if (amount.Currency != Offering.BasePrice.Currency)
                throw new ArgumentException("Payment currency must match the offering's base price currency.");
            if (amount < Offering.BasePrice)
                throw new ArgumentException("Paid amount cannot be lower than base price.");

            var payment = new Payment(payer, amount, externalRef, this);
            _payments.Add(payment);
            return payment;
        }

        // Confirm a payment
        public void ConfirmPayment(Guid paymentId) {
            Payment? payment = _payments.FirstOrDefault(p => p.Id == paymentId);
            if (payment == null)
                throw new InvalidOperationException("Payment not found.");

            payment.MarkCompleted();

            // If first completed payment
            if (Status == CommissionRequestStatus.Accepted &&
                _payments.Count(p => p.Status == PaymentStatus.Completed) == 1) {
                SetStatus(CommissionRequestStatus.InProgress);
            }
        }

        public void AddSubmission(Media media) {
            ArgumentNullException.ThrowIfNull(media);

            // Allow adding submissions when in progress or early draft
            if (Status != CommissionRequestStatus.InProgress && Status != CommissionRequestStatus.Accepted)
                throw new InvalidOperationException($"Cannot add submission in current status.");

            var submission = new Submission(this, media);
            _submissions.Add(submission);
            UpdatedAt = DateTime.UtcNow;
        }

        // Artist marks the commission as delivered
        public void Deliver() {
            if (Status != CommissionRequestStatus.InProgress)
                throw new InvalidOperationException("Can only deliver when commission is in progress.");

            SetStatus(CommissionRequestStatus.Delivered);
        }

        // Bidder approves the delivered work
        public void Approve() {
            if (Status != CommissionRequestStatus.Delivered)
                throw new InvalidOperationException("Can only approve delivered commission.");

            SetStatus(CommissionRequestStatus.Completed);
        }

        public void RequestChanges() {
            if (Status != CommissionRequestStatus.Delivered)
                throw new InvalidOperationException("Can only request changes on delivered commission.");

            SetStatus(CommissionRequestStatus.InProgress);
        }

        // Cancel the commission
        public void Cancel() {
            if (Status == CommissionRequestStatus.Completed || Status == CommissionRequestStatus.Delivered)
                throw new InvalidOperationException("Cannot cancel completed or delivered commission.");

            SetStatus(CommissionRequestStatus.Cancelled);
        }

        public void Accept() => SetStatus(CommissionRequestStatus.Accepted);

        private void SetStatus(CommissionRequestStatus status) {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }

        private static void Validate(User bidder, CommissionOffering offering, string brief) {
            ArgumentNullException.ThrowIfNull(bidder);
            ArgumentNullException.ThrowIfNull(offering);
            if (string.IsNullOrWhiteSpace(brief))
                throw new ArgumentException("Brief is required.");
        }
    }
}
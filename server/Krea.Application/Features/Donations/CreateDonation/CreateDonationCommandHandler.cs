namespace Krea.Application.Features.Donations.CreateDonation {
    using Abstractions.Auth;
    using Application.Abstractions.Payments;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class CreateDonationCommandHandler(
        IUserRepository userRepository,
        IDonationRepository donationRepository,
        IPaymentGateway paymentGateway,
        IUnitOfWork unitOfWork,
        ILogger<CreateDonationCommandHandler> logger,
        ICurrentUserService currentUserService)
        : IRequestHandler<CreateDonationCommand, CreateDonationResponse> {
        public async Task<CreateDonationResponse> Handle(CreateDonationCommand request,
                                                         CancellationToken cancellationToken) {
            // Get current user
            Guid donorId = currentUserService.UserId;
            if (donorId == Guid.Empty)
                throw new UnauthorizedAccessException();

            User? donor = await userRepository.GetByIdAsync(donorId, cancellationToken);
            if (donor == null)
                throw new Exception("Donor not found.");

            User? recipient = await userRepository.GetByIdAsync(request.RecipientId, cancellationToken);
            if (recipient == null)
                throw new Exception("Recipient not found.");

            // Create Stripe Checkout Session
            CheckoutSessionResult session = await paymentGateway.CreateCheckoutSessionAsync(
                request.Amount,
                request.Currency,
                request.SuccessUrl,
                request.CancelUrl
            );

            // Create Donation aggregate
            var amountMoney = new Money(request.Amount, request.Currency);
            var donation = new Donation(donor, recipient, amountMoney, request.Message);

            // Create associated Payment with external reference
            var externalRef = new ExternalPaymentRef("stripe", session.SessionId);
            donation.CreatePayment(donor, amountMoney, externalRef);

            // Save
            await donationRepository.Add(donation);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Donation {DonationId} created with Stripe session {SessionId}", donation.Id,
                session.SessionId);

            return new CreateDonationResponse(donation.Id, session.Url);
        }
    }
}
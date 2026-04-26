namespace Krea.Application.Features.Commissions.CreateCommissionOffering {
    using Abstractions.Auth;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.ValueObjects;
    using Microsoft.Extensions.Logging;

    public class CreateCommissionOfferingCommandHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ICommissionOfferingRepository offeringRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateCommissionOfferingCommandHandler> logger)
        : IRequestHandler<CreateCommissionOfferingCommand, CreateCommissionOfferingResponse>
    {
        public async Task<CreateCommissionOfferingResponse> Handle(
            CreateCommissionOfferingCommand request,
            CancellationToken cancellationToken)
        {
            var artistId = currentUserService.UserId;
            if (artistId == Guid.Empty)
                throw new UnauthorizedAccessException("User not authenticated.");

            var artist = await userRepository.GetByIdAsync(artistId, cancellationToken);
            if (artist == null)
                throw new Exception("Artist not found.");

            var basePrice = new Money(request.Amount, request.Currency);

            var offering = new CommissionOffering(
                artist,
                request.Title,
                basePrice,
                request.MaxSlots,
                request.Description);

            await offeringRepository.AddAsync(offering);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Commission offering {OfferingId} created by artist {ArtistId}", offering.Id, artistId);

            return new CreateCommissionOfferingResponse(offering.Id);
        }
    }
}
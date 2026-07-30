using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface ICommissionRequestRepository {
        Task<CommissionRequest?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CommissionRequest>> GetByArtistAsync(
            Guid artistId,
            CancellationToken cancellationToken = default);

        Task<CommissionRequest?> GetByIdWithAllAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<CommissionRequest?> GetByIdWithPaymentsAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<CommissionRequest?> GetByIdWithSubmissionsAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CommissionRequest>> GetByBidderAsync(
            Guid bidderId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CommissionRequest>> GetByOfferingAsync(
            Guid offeringId,
            CancellationToken cancellationToken = default);

        Task<CommissionRequest?> GetBySubmissionIdAsync(
            Guid submissionId,
            CancellationToken cancellationToken = default);

        Task<CommissionRequest?> GetByFeedbackIdAsync(
            Guid feedbackId,
            CancellationToken cancellationToken = default);

        Task<CommissionRequest?> GetByIdWithOfferingForUpdateAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task AddAsync(
            CommissionRequest request,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            CommissionRequest request,
            CancellationToken cancellationToken = default);
    }
}
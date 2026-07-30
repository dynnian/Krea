namespace Krea.Application.Features.Commissions.GetRequestDetails {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dtos;

    public class GetRequestDetailsQueryHandler(
        ICommissionRequestRepository requestRepository)
        : IRequestHandler<GetRequestDetailsQuery, CommissionRequestDto> {
        public async Task<CommissionRequestDto> Handle(GetRequestDetailsQuery request,
                                                       CancellationToken cancellationToken) {
            CommissionRequest? commissionRequest =
                await requestRepository.GetByIdWithAllAsync(request.RequestId, cancellationToken);
            if (commissionRequest == null)
                throw new Exception("Commission request not found.");

            List<PaymentInfoDto> payments = commissionRequest.Payments.Select(p =>
                new PaymentInfoDto(p.Id, p.Amount.Amount, p.Amount.Currency, p.Status.ToString(), p.PaidAt)).ToList();
            List<SubmissionDto> submissions = commissionRequest.Submissions.Select(s => new SubmissionDto(
                s.Id,
                s.MediaId,
                s.Media.Path,
                s.Feedback.Select(f =>
                    new SubmissionFeedbackDto(f.Id, f.Author.Id, f.Author.DisplayName, f.Content, f.CreatedAt,
                        f.UpdatedAt)).ToList()
            )).ToList();

            return new CommissionRequestDto(
                commissionRequest.Id,
                commissionRequest.Brief,
                commissionRequest.Status.ToString(),
                commissionRequest.CreatedAt,
                commissionRequest.UpdatedAt,
                new CommissionOfferingMinimalDto(commissionRequest.Offering.Id, commissionRequest.Offering.Title,
                    commissionRequest.Offering.BasePrice.Amount, commissionRequest.Offering.BasePrice.Currency),
                new BidderInfoDto(commissionRequest.Bidder.Id, commissionRequest.Bidder.DisplayName),
                payments,
                submissions);
        }
    }
}
using Krea.Application.Features.Payments.Dtos;
using Krea.Application.Abstractions.Payments;
using Krea.Domain.Entities;
using Krea.Domain.ValueObjects;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PaymentEntity = Krea.Domain.Entities.Payment;

namespace Krea.Infrastructure.Services {
    public class PaymentReadService : IPaymentReadService {
        private readonly AppDbContext _context;

        public PaymentReadService(AppDbContext context) => _context = context;

        public async Task<PagedResult<PaymentSummaryDto>> GetSentPaymentsAsync(
            Guid userId,
            PaymentFilter filter,
            CancellationToken cancellationToken = default) {
            IQueryable<PaymentEntity> query = _context.Payments
                                                      .Include(p => p.Payer)
                                                      .Include(p => p.Donation)
                                                      .ThenInclude(d => d!.Recipient)
                                                      .Include(p => p.CommissionRequest)
                                                      .ThenInclude(cr => cr!.Offering)
                                                      .Include(p => p.Subscription)
                                                      .ThenInclude(s => s!.Plan)
                                                      .Where(p => p.Payer.Id == userId)
                                                      .AsNoTracking();

            query = ApplyFilters(query, filter);
            query = ApplySorting(query);

            int totalCount = await query.CountAsync(cancellationToken);

            List<PaymentSummaryDto> items = await query
                                                  .Skip((filter.Page - 1) * filter.PageSize)
                                                  .Take(filter.PageSize)
                                                  .Select(p => new PaymentSummaryDto(
                                                      p.Id,
                                                      GetPaymentTypeString(p),
                                                      p.Amount.Amount,
                                                      p.Amount.Currency,
                                                      p.Status.ToString(),
                                                      p.PaidAt,
                                                      GetCounterpartyName(p, isSent: true),
                                                      GetReference(p),
                                                      GetEntityId(p)
                                                  ))
                                                  .ToListAsync(cancellationToken);

            return new PagedResult<PaymentSummaryDto>(items, totalCount, filter.Page, filter.PageSize);
        }

        public async Task<PagedResult<PaymentSummaryDto>> GetReceivedPaymentsAsync(
            Guid userId,
            PaymentFilter filter,
            CancellationToken cancellationToken = default) {
            IQueryable<PaymentEntity> query = _context.Payments
                                                      .Include(p => p.Donation)
                                                      .ThenInclude(d => d!.Recipient)
                                                      .Include(p => p.CommissionRequest)
                                                      .ThenInclude(cr => cr!.Offering)
                                                      .ThenInclude(o => o!.Artist)
                                                      .Include(p => p.Subscription)
                                                      .ThenInclude(s => s!.Plan)
                                                      .ThenInclude(plan => plan!.Artist)
                                                      .Where(p => (p.Donation != null &&
                                                                   p.Donation.Recipient.Id == userId)
                                                                  || (p.CommissionRequest != null &&
                                                                      p.CommissionRequest.Offering.Artist.Id == userId)
                                                                  || (p.Subscription != null &&
                                                                      p.Subscription.Plan.Artist.Id == userId))
                                                      .AsNoTracking();

            query = ApplyFilters(query, filter);
            query = ApplySorting(query);

            int totalCount = await query.CountAsync(cancellationToken);

            List<PaymentSummaryDto> items = await query
                                                  .Skip((filter.Page - 1) * filter.PageSize)
                                                  .Take(filter.PageSize)
                                                  .Select(p => new PaymentSummaryDto(
                                                      p.Id,
                                                      GetPaymentTypeString(p),
                                                      p.Amount.Amount,
                                                      p.Amount.Currency,
                                                      p.Status.ToString(),
                                                      p.PaidAt,
                                                      GetCounterpartyName(p, isSent: false),
                                                      GetReference(p),
                                                      GetEntityId(p)
                                                  ))
                                                  .ToListAsync(cancellationToken);

            return new PagedResult<PaymentSummaryDto>(items, totalCount, filter.Page, filter.PageSize);
        }

        public async Task<PaymentReceiptDto?> GetPaymentReceiptDataAsync(
            Guid paymentId,
            CancellationToken cancellationToken = default) {
            Payment? payment = await _context.Payments
                                             .Include(p => p.Payer)
                                             .Include(p => p.Donation)
                                             .ThenInclude(d => d!.Recipient)
                                             .Include(p => p.CommissionRequest)
                                             .ThenInclude(cr => cr!.Offering)
                                             .ThenInclude(o => o!.Artist)
                                             .Include(p => p.Subscription)
                                             .ThenInclude(s => s!.Plan)
                                             .ThenInclude(plan => plan!.Artist)
                                             .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken);

            if (payment == null) return null;

            string payerName = payment.Payer.DisplayName;
            string recipientName;
            string? reference = null;
            string? additionalInfo = null;

            if (payment.Donation != null) {
                recipientName = payment.Donation.Recipient.DisplayName;
                reference = payment.Donation.Message;
                additionalInfo = $"Donation message: {reference ?? "No message"}";
            }
            else if (payment.CommissionRequest != null) {
                recipientName = payment.CommissionRequest.Offering.Artist.DisplayName;
                reference = payment.CommissionRequest.Offering.Title;
                additionalInfo = $"Commission: {reference} - {payment.CommissionRequest.Brief}";
            }
            else if (payment.Subscription != null) {
                recipientName = payment.Subscription.Plan.Artist.DisplayName;
                reference = payment.Subscription.Plan.Name;
                additionalInfo = $"Subscription to {reference}";
            }
            else {
                recipientName = "Unknown";
            }

            return new PaymentReceiptDto(
                payment.Id,
                GetPaymentTypeString(payment),
                payment.Amount.Amount,
                payment.Amount.Currency,
                payment.Status.ToString(),
                payment.PaidAt ?? payment.CreatedAt, // Use CreatedAt if PaidAt is null
                payerName,
                recipientName,
                reference,
                additionalInfo);
        }

        // Private helper methods
        private static IQueryable<PaymentEntity> ApplyFilters(IQueryable<PaymentEntity> query, PaymentFilter filter) {
            if (!string.IsNullOrEmpty(filter.PaymentType)) {
                query = query.Where(p => GetPaymentTypeString(p) == filter.PaymentType);
            }

            if (!string.IsNullOrEmpty(filter.Status)) {
                if (Enum.TryParse<PaymentStatus>(filter.Status, true, out PaymentStatus status))
                    query = query.Where(p => p.Status == status);
            }

            if (filter.From.HasValue)
                query = query.Where(p => (p.PaidAt ?? p.CreatedAt) >= filter.From.Value);
            if (filter.To.HasValue)
                query = query.Where(p => (p.PaidAt ?? p.CreatedAt) <= filter.To.Value);

            return query;
        }

        private static IQueryable<PaymentEntity> ApplySorting(IQueryable<PaymentEntity> query) =>
            query.OrderByDescending(p => p.PaidAt ?? p.CreatedAt);

        private static string GetPaymentTypeString(PaymentEntity p) =>
            p.Donation != null ? "Donation" :
            p.CommissionRequest != null ? "Commission" : "Subscription";

        private static string GetCounterpartyName(PaymentEntity p, bool isSent) {
            if (isSent) {
                if (p.Donation != null) return p.Donation.Recipient.DisplayName;
                if (p.CommissionRequest != null) return p.CommissionRequest.Offering.Artist.DisplayName;
                if (p.Subscription != null) return p.Subscription.Plan.Artist.DisplayName;
            }
            else {
                return p.Payer.DisplayName;
            }

            return "Unknown";
        }

        private static string? GetReference(PaymentEntity p) {
            if (p.Donation != null) return p.Donation.Message;
            if (p.CommissionRequest != null) return p.CommissionRequest.Offering.Title;
            if (p.Subscription != null) return p.Subscription.Plan.Name;
            return null;
        }

        private static string? GetEntityId(PaymentEntity p) {
            if (p.Donation != null) return p.Donation.Id.ToString();
            if (p.CommissionRequest != null) return p.CommissionRequest.Id.ToString();
            if (p.Subscription != null) return p.Subscription.Id.ToString();
            return null;
        }
    }
}
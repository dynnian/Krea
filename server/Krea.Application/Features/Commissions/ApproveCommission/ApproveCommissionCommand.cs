namespace Krea.Application.Features.Commissions.ApproveCommission;

using Domain.Abstractions;

public record ApproveCommissionCommand(Guid RequestId) : IRequest<Unit>;
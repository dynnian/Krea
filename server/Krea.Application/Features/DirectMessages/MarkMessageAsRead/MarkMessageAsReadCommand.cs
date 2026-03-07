namespace Krea.Application.Features.DirectMessages.MarkMessageAsRead;

using Domain.Abstractions;

public record MarkMessageAsReadCommand(
    Guid MessageId,
    Guid UserId   // usuario que marca como leído
) : IRequest<bool>;
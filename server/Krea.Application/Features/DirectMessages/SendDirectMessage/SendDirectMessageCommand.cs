namespace Krea.Application.Features.DirectMessages.SendDirectMessage {
    using Domain.Abstractions;
    using Dto;

    public record SendDirectMessageCommand(
        Guid SenderId,
        Guid ReceiverId,
        string Content
    ) : IRequest<DirectMessageDto>;
}
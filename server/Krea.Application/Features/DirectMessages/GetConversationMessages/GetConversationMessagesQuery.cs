namespace Krea.Application.Features.DirectMessages.GetConversationMessages {
    using Domain.Abstractions;
    using Dto;

    public record GetConversationMessagesQuery(
        Guid UserId,
        Guid ConversationId,
        int Page = 1,
        int PageSize = 20
    ) : IRequest<List<DirectMessageDto>>;
}
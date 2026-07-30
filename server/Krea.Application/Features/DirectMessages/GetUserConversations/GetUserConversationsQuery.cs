namespace Krea.Application.Features.DirectMessages.GetUserConversations {
    using Domain.Abstractions;
    using Dto;

    public record GetUserConversationsQuery(Guid UserId) : IRequest<List<ConversationPreviewDto>>;
}
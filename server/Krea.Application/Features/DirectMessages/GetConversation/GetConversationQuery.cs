namespace Krea.Application.Features.DirectMessages.GetConversation;
using Domain.Abstractions;
using Dto;

public record GetConversationQuery(
    Guid UserId,
    Guid OtherUserId,
    int? Page = 1,
    int? PageSize = 20
) : IRequest<ConversationDto>;
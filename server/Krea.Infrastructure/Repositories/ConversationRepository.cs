namespace Krea.Infrastructure.Repositories;

using Domain.ValueObjects;
using Domain.Entities;
using Domain.Repositories;
using Data;
using Microsoft.EntityFrameworkCore;

public class ConversationRepository(AppDbContext context) : IConversationRepository {
    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Conversations
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.Messages)
                .ThenInclude(m => m.User)
            .Include(c => c.Messages)
                .ThenInclude(m => m.MediaAttachments)
            .Include(c => c.Icon)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }
    
    public async Task<IEnumerable<Conversation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.Conversations
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .Include(c => c.Icon)
            .Where(c => c.Participants.Any(p => p.UserId == userId && p.LeftAt == null))
            .ToListAsync(cancellationToken);
    }

    public async Task<Conversation?> GetDirectMessageBetweenAsync(Guid user1Id, Guid user2Id, CancellationToken cancellationToken = default)
    {
        return await context.Conversations
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.Messages)
            .Include(c => c.Icon)
            .Where(c => c.Type == ConversationType.DirectMessage)
            .Where(c => c.Participants.Any(p => p.UserId == user1Id && p.LeftAt == null))
            .Where(c => c.Participants.Any(p => p.UserId == user2Id && p.LeftAt == null))
            .Where(c => c.Participants.Count(p => p.LeftAt == null) == 2)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public void Add(Conversation conversation)
    {
        context.Conversations.Add(conversation);
    }

    public void Update(Conversation conversation)
    {
        context.Conversations.Update(conversation);
    }

    public void Delete(Conversation conversation)
    {
        context.Conversations.Remove(conversation);
    }
}
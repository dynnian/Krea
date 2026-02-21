using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories;

public sealed class ConversationRepository : IConversationRepository
{
    private readonly AppDbContext _context;

    public ConversationRepository(AppDbContext context) => _context = context;

    public async Task<Conversation?> GetByIdAsync(Guid id)
        => await _context.Conversations
            .Include(c => c.Icon)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IReadOnlyList<Conversation>> GetAllAsync()
        => await _context.Conversations
            .Include(c => c.Icon)
            .ToListAsync();

    public async Task AddAsync(Conversation conversation)
        => await _context.Conversations.AddAsync(conversation);

    public Task UpdateAsync(Conversation conversation)
    {
        _context.Conversations.Update(conversation);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Conversation conversation)
    {
        _context.Conversations.Remove(conversation);
        return Task.CompletedTask;
    }
}
using Krea.Domain.Entities;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Krea.Infrastructure.Repositories {
    public sealed class MessageRepository : IMessageRepository {
        private readonly AppDbContext _context;

        public MessageRepository(AppDbContext context) => _context = context;

        public async Task<Message?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => await _context.Messages
                             .Include(m => m.User)
                             .Include(m => m.Conversation)
                             .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        public async Task<IReadOnlyList<Message>> GetByConversationAsync(Guid conversationId, CancellationToken cancellationToken = default)
            => await _context.Messages
                             .Include(m => m.User)
                             .Where(m => EF.Property<Guid>(m, "ConversationId") == conversationId)
                             .OrderBy(m => m.SentAt)
                             .ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<Message>> GetByUserAsync(Guid userId, CancellationToken  cancellationToken = default)
            => await _context.Messages
                             .Include(m => m.Conversation)
                             .Where(m => EF.Property<Guid>(m, "UserId") == userId)
                             .OrderByDescending(m => m.SentAt)
                             .ToListAsync(cancellationToken);

        public async Task Add(Message message)
            => await _context.Messages.AddAsync(message);

        public Task Update(Message message) {
            _context.Messages.Update(message);
            return Task.CompletedTask;
        }

        public Task Delete(Message message) {
            _context.Messages.Remove(message);
            return Task.CompletedTask;
        }
    }
}
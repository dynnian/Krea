using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IMessageRepository {
        Task<Message?> GetByIdAsync(Guid id);
        Task<IReadOnlyList<Message>> GetByConversationAsync(Guid conversationId);
        Task<IReadOnlyList<Message>> GetByUserAsync(Guid userId);
        Task AddAsync(Message message);
        Task UpdateAsync(Message message);
        Task DeleteAsync(Message message);
    }
}
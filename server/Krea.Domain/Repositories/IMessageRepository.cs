using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IMessageRepository {
        Task<Message?> GetByIdAsync(Guid id,  CancellationToken cancellationToken =  default);
        Task<IReadOnlyList<Message>> GetByConversationAsync(Guid conversationId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Message>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
        Task Add(Message message);
        Task Update(Message message);
        Task Delete(Message message);
    }
}
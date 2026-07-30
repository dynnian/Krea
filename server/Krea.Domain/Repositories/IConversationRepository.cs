using Krea.Domain.Entities;

namespace Krea.Domain.Repositories {
    public interface IConversationRepository {
        Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Conversation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

        Task<Conversation?> GetDirectMessageBetweenAsync(Guid user1Id, Guid user2Id,
                                                         CancellationToken cancellationToken = default);

        void Add(Conversation conversation);
        void Update(Conversation conversation);
        void Delete(Conversation conversation);
    }
}
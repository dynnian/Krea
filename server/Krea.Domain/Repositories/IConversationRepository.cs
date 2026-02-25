using Krea.Domain.Entities;

namespace Krea.Domain.Repositories
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByIdAsync(Guid id);
        Task<IReadOnlyList<Conversation>> GetAllAsync();
        Task AddAsync(Conversation conversation);
        Task UpdateAsync(Conversation conversation);
        Task DeleteAsync(Conversation conversation);
    }
}
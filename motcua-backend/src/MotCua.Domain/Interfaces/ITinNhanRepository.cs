using MotCua.Domain.Entities;

namespace MotCua.Domain.Interfaces;

public interface ITinNhanRepository
{
    Task<TinNhan?> GetByIdAsync(Guid id);
    Task<IEnumerable<TinNhan>> GetPendingMessagesAsync(int limit = 50);
    Task<TinNhan> AddAsync(TinNhan tinNhan);
    Task UpdateAsync(TinNhan tinNhan);
}

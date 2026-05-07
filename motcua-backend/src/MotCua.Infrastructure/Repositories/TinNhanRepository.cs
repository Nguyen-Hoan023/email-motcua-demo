using Microsoft.EntityFrameworkCore;
using MotCua.Domain.Entities;
using MotCua.Domain.Enums;
using MotCua.Domain.Interfaces;
using MotCua.Infrastructure.Data;

namespace MotCua.Infrastructure.Repositories;

public class TinNhanRepository : ITinNhanRepository
{
    private readonly MotCuaDbContext _context;

    public TinNhanRepository(MotCuaDbContext context)
    {
        _context = context;
    }

    public async Task<TinNhan> AddAsync(TinNhan tinNhan)
    {
        _context.TinNhans.Add(tinNhan);
        await _context.SaveChangesAsync();
        return tinNhan;
    }

    public async Task<TinNhan?> GetByIdAsync(Guid id)
    {
        return await _context.TinNhans.FindAsync(id);
    }

    public async Task<IEnumerable<TinNhan>> GetPendingMessagesAsync(int limit = 50)
    {
        return await _context.TinNhans
            .Where(x => x.TrangThai == TrangThaiTinNhan.PENDING)
            .OrderBy(x => x.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task UpdateAsync(TinNhan tinNhan)
    {
        _context.TinNhans.Update(tinNhan);
        await _context.SaveChangesAsync();
    }
}

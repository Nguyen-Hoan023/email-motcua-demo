using Microsoft.EntityFrameworkCore;
using MotCua.Domain.Entities;
using MotCua.Domain.Interfaces;
using MotCua.Infrastructure.Data;

namespace MotCua.Infrastructure.Repositories;

public class NguoiDungRepository : INguoiDungRepository
{
    private readonly MotCuaDbContext _context;

    public NguoiDungRepository(MotCuaDbContext context)
    {
        _context = context;
    }

    public async Task<NguoiDung?> GetByIdAsync(Guid id)
    {
        return await _context.NguoiDungs
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<NguoiDung?> GetByUsernameAsync(string username)
    {
        return await _context.NguoiDungs
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Username == username);
    }

    public async Task AddAsync(NguoiDung user)
    {
        await _context.NguoiDungs.AddAsync(user);
        await _context.SaveChangesAsync();
    }
}

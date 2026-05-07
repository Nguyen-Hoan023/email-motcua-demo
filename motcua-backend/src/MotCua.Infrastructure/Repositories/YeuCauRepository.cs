using Microsoft.EntityFrameworkCore;
using MotCua.Domain.Entities;
using MotCua.Domain.Interfaces;
using MotCua.Infrastructure.Data;

namespace MotCua.Infrastructure.Repositories;

public class YeuCauRepository : IYeuCauRepository
{
    private readonly MotCuaDbContext _context;

    public YeuCauRepository(MotCuaDbContext context)
    {
        _context = context;
    }

    public async Task<YeuCauDichVu> AddAsync(YeuCauDichVu yeuCau)
    {
        _context.YeuCauDichVus.Add(yeuCau);
        await _context.SaveChangesAsync();
        return yeuCau;
    }

    public async Task<IEnumerable<YeuCauDichVu>> GetAllAsync()
    {
        return await _context.YeuCauDichVus
            .Include(x => x.SinhVien)
            .Include(x => x.TaiNguyens)
            .OrderByDescending(x => x.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<YeuCauDichVu>> GetAllBySinhVienIdAsync(Guid sinhVienId)
    {
        return await _context.YeuCauDichVus
            .Include(x => x.SinhVien)
            .Include(x => x.TaiNguyens)
            .Where(x => x.SinhVienId == sinhVienId)
            .OrderByDescending(x => x.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<YeuCauDichVu?> GetByIdAsync(Guid id)
    {
        return await _context.YeuCauDichVus
            .Include(x => x.SinhVien)
            .Include(x => x.PhanHoiYeuCaus)
            .Include(x => x.Logs)
            .Include(x => x.TaiNguyens)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task UpdateStatusAsync(Guid id, int newStatus)
    {
        // Update trực tiếp qua SQL, không cần load entity
        await _context.YeuCauDichVus
            .Where(x => x.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.TrangThai, (Domain.Enums.TrangThaiYeuCau)newStatus)
                .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));
    }

    public async Task AddLogAsync(LogYeuCauDichVu log)
    {
        _context.LogYeuCauDichVus.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task AddPhanHoiAsync(PhanHoiYeuCau phanHoi)
    {
        _context.PhanHoiYeuCaus.Add(phanHoi);
        await _context.SaveChangesAsync();
    }

    public async Task AddTaiNguyenAsync(TaiNguyen taiNguyen)
    {
        _context.TaiNguyens.Add(taiNguyen);
        await _context.SaveChangesAsync();
    }

    public async Task DeactivateTaiNguyensAsync(Guid yeuCauId)
    {
        await _context.TaiNguyens
            .Where(t => t.YeuCauId == yeuCauId && t.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsActive, false));
    }
}

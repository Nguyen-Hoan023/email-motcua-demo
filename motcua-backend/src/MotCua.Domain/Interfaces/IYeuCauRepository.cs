using MotCua.Domain.Entities;

namespace MotCua.Domain.Interfaces;

public interface IYeuCauRepository
{
    Task<YeuCauDichVu?> GetByIdAsync(Guid id);
    Task<IEnumerable<YeuCauDichVu>> GetAllBySinhVienIdAsync(Guid sinhVienId);
    Task<IEnumerable<YeuCauDichVu>> GetAllAsync();
    Task<YeuCauDichVu> AddAsync(YeuCauDichVu yeuCau);
    Task UpdateStatusAsync(Guid id, int newStatus);
    Task AddLogAsync(LogYeuCauDichVu log);
    Task AddPhanHoiAsync(PhanHoiYeuCau phanHoi);
    Task AddTaiNguyenAsync(TaiNguyen taiNguyen);
}

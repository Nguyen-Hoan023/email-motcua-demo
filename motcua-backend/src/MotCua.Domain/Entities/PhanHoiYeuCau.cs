using MotCua.Domain.Enums;

namespace MotCua.Domain.Entities;

public class PhanHoiYeuCau
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid YeuCauId { get; set; }
    public YeuCauDichVu? YeuCau { get; set; }
    
    public LoaiNguoiDung NguoiGuiType { get; set; }
    public string NoiDung { get; set; } = string.Empty;
    public PhuongThucXuLy? PhuongThucXuLy { get; set; }
    public string? MatKhauTamThoi { get; set; }
    public string? AccountLabel { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

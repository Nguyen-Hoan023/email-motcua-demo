using MotCua.Domain.Enums;

namespace MotCua.Domain.Entities;

public class YeuCauDichVu
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MaYeuCau { get; set; } = string.Empty;
    public string MaDichVu { get; set; } = string.Empty;
    public string TenDichVu { get; set; } = string.Empty;
    
    public Guid SinhVienId { get; set; }
    public NguoiDung? SinhVien { get; set; }
    
    public TrangThaiYeuCau TrangThai { get; set; } = TrangThaiYeuCau.SV_GUI;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PhanHoiYeuCau> PhanHoiYeuCaus { get; set; } = new List<PhanHoiYeuCau>();
    public ICollection<LogYeuCauDichVu> Logs { get; set; } = new List<LogYeuCauDichVu>();
    public ICollection<TaiNguyen> TaiNguyens { get; set; } = new List<TaiNguyen>();
}

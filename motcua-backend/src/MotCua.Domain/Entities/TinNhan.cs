using MotCua.Domain.Enums;

namespace MotCua.Domain.Entities;

public class TinNhan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid YeuCauId { get; set; }
    public YeuCauDichVu? YeuCau { get; set; }
    
    public LoaiTinNhan LoaiTinNhan { get; set; }
    public string NoiDung { get; set; } = string.Empty;
    public string EmailNhan { get; set; } = string.Empty;
    public TrangThaiTinNhan TrangThai { get; set; } = TrangThaiTinNhan.PENDING;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
}

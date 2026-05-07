namespace MotCua.Domain.Entities;

public class TaiNguyen
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid YeuCauId { get; set; }
    public YeuCauDichVu? YeuCau { get; set; }
    
    public string TenFile { get; set; } = string.Empty;
    public string DuongDan { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long KichThuoc { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

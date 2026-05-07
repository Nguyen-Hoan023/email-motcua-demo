namespace MotCua.Domain.Entities;

public class LogYeuCauDichVu
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid YeuCauId { get; set; }
    public YeuCauDichVu? YeuCau { get; set; }
    
    public string HanhDong { get; set; } = string.Empty;
    public Guid NguoiThucHienId { get; set; }
    
    public DateTime ThoiGian { get; set; } = DateTime.UtcNow;
}

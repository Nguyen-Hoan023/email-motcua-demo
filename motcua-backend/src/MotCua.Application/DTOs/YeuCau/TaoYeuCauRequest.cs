namespace MotCua.Application.DTOs.YeuCau;

public class TaoYeuCauRequest
{
    public string MaDichVu { get; set; } = string.Empty;
    public string TenDichVu { get; set; } = string.Empty;
    public List<Guid> TaiNguyenIds { get; set; } = new List<Guid>();
    public List<string> AttachedFiles { get; set; } = new List<string>();
}

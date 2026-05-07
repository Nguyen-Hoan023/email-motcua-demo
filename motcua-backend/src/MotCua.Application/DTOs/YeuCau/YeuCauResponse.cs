using MotCua.Domain.Enums;

namespace MotCua.Application.DTOs.YeuCau;

public class YeuCauResponse
{
    public Guid Id { get; set; }
    public string MaYeuCau { get; set; } = string.Empty;
    public string MaDichVu { get; set; } = string.Empty;
    public string TenDichVu { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string SinhVienName { get; set; } = string.Empty;
    public string SinhVienIdText { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string Lop { get; set; } = string.Empty;
    public string Khoa { get; set; } = string.Empty;
    public TrangThaiYeuCau TrangThai { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> AttachedFiles { get; set; } = new List<string>();
}

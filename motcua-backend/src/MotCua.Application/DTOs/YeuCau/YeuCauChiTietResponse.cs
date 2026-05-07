using MotCua.Domain.Enums;

namespace MotCua.Application.DTOs.YeuCau;

public class YeuCauChiTietResponse : YeuCauResponse
{
    public List<PhanHoiResponse> PhanHois { get; set; } = new List<PhanHoiResponse>();
    public List<LogResponse> Logs { get; set; } = new List<LogResponse>();
    public List<FileResponse> Files { get; set; } = new List<FileResponse>();
}

public class PhanHoiResponse
{
    public Guid Id { get; set; }
    public Guid ReqId { get; set; }
    public string NguoiGuiType { get; set; } = string.Empty;
    public string SenderType { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public PhuongThucXuLy? PhuongThucXuLy { get; set; }
    public string ResetMethod { get; set; } = "manual";
    public string? AccountType { get; set; }
    public string? AccountLabel { get; set; }
    public string? Password { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LogResponse
{
    public string HanhDong { get; set; } = string.Empty;
    public DateTime ThoiGian { get; set; }
}

public class FileResponse
{
    public Guid Id { get; set; }
    public string TenFile { get; set; } = string.Empty;
}

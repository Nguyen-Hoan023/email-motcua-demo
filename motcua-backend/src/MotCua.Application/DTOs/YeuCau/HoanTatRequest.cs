using MotCua.Domain.Enums;

namespace MotCua.Application.DTOs.YeuCau;

public class HoanTatRequest
{
    public PhuongThucXuLy PhuongThucXuLy { get; set; }
    public string? MatKhauMoi { get; set; }
    public string? AccountType { get; set; }
    public string? AccountLabel { get; set; }
}

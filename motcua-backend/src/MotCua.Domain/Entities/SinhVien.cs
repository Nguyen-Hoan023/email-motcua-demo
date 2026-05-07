namespace MotCua.Domain.Entities;

public class SinhVien : NguoiDung
{
    public string MaSinhVien { get; set; } = string.Empty;
    public string Lop { get; set; } = string.Empty;
    public string Khoa { get; set; } = string.Empty;
    public string MatKhauEmail { get; set; } = string.Empty;
    public string TaiKhoanMicrosoft { get; set; } = string.Empty;
    public string TaiKhoanCongSV { get; set; } = string.Empty;
}

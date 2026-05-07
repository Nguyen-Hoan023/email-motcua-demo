using MotCua.Domain.Enums;

namespace MotCua.Domain.Entities;

public class NguoiDung
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public LoaiNguoiDung LoaiNguoiDung { get; set; }
    
    public Guid? RoleId { get; set; }
    public Role? Role { get; set; }
}

using Microsoft.EntityFrameworkCore;
using MotCua.Domain.Entities;
using MotCua.Domain.Enums;
using MotCua.Infrastructure.Data;

namespace MotCua.API;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MotCuaDbContext>();

        // Xóa database cũ nếu schema thay đổi, rồi tạo lại.
        // EnsureCreated không cập nhật schema nếu DB đã tồn tại.
        // Nên thử query đầy đủ các cột mới — nếu lỗi thì xóa và tạo lại.
        try
        {
            // Thử query cả cột mới (Lop, Khoa) để phát hiện schema cũ
            await db.SinhViens.Select(x => new { x.Id, x.Lop, x.Khoa }).FirstOrDefaultAsync();
        }
        catch
        {
            // Schema cũ hoặc bảng chưa tồn tại → Xóa DB rồi tạo lại
            await db.Database.EnsureDeletedAsync();
            await db.Database.EnsureCreatedAsync();
        }

        // Seed sinh viên mặc định: 0009167
        var student = await db.SinhViens.FirstOrDefaultAsync(x => x.Id == DemoUsers.StudentId || x.MaSinhVien == DemoUsers.StudentCode);
        if (student == null)
        {
            student = new SinhVien
            {
                Id = DemoUsers.StudentId,
                Username = DemoUsers.StudentCode,
                PasswordHash = "123",
                LoaiNguoiDung = LoaiNguoiDung.SINH_VIEN,
                MaSinhVien = DemoUsers.StudentCode
            };
            db.SinhViens.Add(student);
        }

        student.HoTen = DemoUsers.StudentDisplayName;
        student.Email = DemoUsers.StudentEmail;
        student.Username = DemoUsers.StudentCode;
        student.PasswordHash = "123";
        student.LoaiNguoiDung = LoaiNguoiDung.SINH_VIEN;
        student.MaSinhVien = DemoUsers.StudentCode;
        student.Lop = "67CNCS";
        student.Khoa = "Công nghệ thông tin";
        student.TaiKhoanMicrosoft = DemoUsers.StudentOfficeAccount;
        student.TaiKhoanCongSV = DemoUsers.StudentCode;

        // Seed cán bộ mặc định: cb01 - Trần Văn A
        var officer = await db.CanBos.FirstOrDefaultAsync(x => x.Id == DemoUsers.OfficerId || x.Username == DemoUsers.OfficerCode);
        if (officer == null)
        {
            officer = new CanBo
            {
                Id = DemoUsers.OfficerId,
                Username = DemoUsers.OfficerCode,
                PasswordHash = "admin",
                LoaiNguoiDung = LoaiNguoiDung.CAN_BO
            };
            db.CanBos.Add(officer);
        }

        officer.HoTen = DemoUsers.OfficerName;
        officer.Email = DemoUsers.OfficerEmail;
        officer.Username = DemoUsers.OfficerCode;
        officer.PasswordHash = "admin";
        officer.LoaiNguoiDung = LoaiNguoiDung.CAN_BO;
        officer.ChucVu = "Cán bộ Một Cửa";

        await db.SaveChangesAsync();
    }
}

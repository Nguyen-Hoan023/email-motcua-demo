using System.Security.Cryptography;
using System.Text.RegularExpressions;
using MotCua.Application.DTOs.YeuCau;
using MotCua.Application.Interfaces;
using MotCua.Domain.Entities;
using MotCua.Domain.Enums;
using MotCua.Domain.Interfaces;

namespace MotCua.Application.Services;

// Service trung tâm xử lý toàn bộ nghiệp vụ của yêu cầu dịch vụ.
public class YeuCauService : IYeuCauService
{
    private readonly IYeuCauRepository _yeuCauRepository;
    private readonly INguoiDungRepository _nguoiDungRepository;
    private readonly ITinNhanRepository _tinNhanRepository;
    private readonly INotificationService _notificationService;

    public YeuCauService(
        IYeuCauRepository yeuCauRepository,
        INguoiDungRepository nguoiDungRepository,
        ITinNhanRepository tinNhanRepository,
        INotificationService notificationService)
    {
        _yeuCauRepository = yeuCauRepository;
        _nguoiDungRepository = nguoiDungRepository;
        _tinNhanRepository = tinNhanRepository;
        _notificationService = notificationService;
    }

       // Tạo yêu cầu mới, thêm file đính kèm, log khởi tạo và tin nhắn thông báo.
    public async Task<Guid> TaoYeuCauAsync(TaoYeuCauRequest request, Guid sinhVienId)
    {
        var sv = await _nguoiDungRepository.GetByIdAsync(sinhVienId);
        if (sv == null || sv is not SinhVien sinhVien)
            throw new Exception("Không tìm thấy thông tin sinh viên demo.");

        var tenDichVu = string.IsNullOrWhiteSpace(request.TenDichVu)
            ? "Cấp lại mật khẩu tài khoản Email"
            : request.TenDichVu;

        var yeuCau = new YeuCauDichVu
        {
            MaYeuCau = $"YC{DateTime.Now:HHmmss}",
            MaDichVu = string.IsNullOrWhiteSpace(request.MaDichVu) ? "DT01" : request.MaDichVu,
            TenDichVu = tenDichVu,
            SinhVienId = sinhVienId,
            TrangThai = TrangThaiYeuCau.SV_GUI
        };

        foreach (var fileName in request.AttachedFiles.Where(x => !string.IsNullOrWhiteSpace(x)))
        {
            yeuCau.TaiNguyens.Add(new TaiNguyen
            {
                TenFile = fileName,
                DuongDan = $"demo/{fileName}",
                ContentType = "application/octet-stream"
            });
        }

        yeuCau.Logs.Add(new LogYeuCauDichVu
        {
            HanhDong = "Khởi tạo yêu cầu",
            NguoiThucHienId = sinhVienId
        });

        // AddAsync sẽ insert cả yeuCau + con (Logs, TaiNguyens) cùng lúc
        await _yeuCauRepository.AddAsync(yeuCau);

        await _tinNhanRepository.AddAsync(new TinNhan
        {
            YeuCauId = yeuCau.Id,
            LoaiTinNhan = LoaiTinNhan.NOTIFY_CANBO,
            NoiDung = $"Yêu cầu mới từ {sv.HoTen}",
            TrangThai = TrangThaiTinNhan.PENDING
        });

        await _notificationService.NotifyDataUpdateAsync();

        return yeuCau.Id;
    }
 // Lấy danh sách yêu cầu theo sinh viên và map sang DTO hiển thị.
    public async Task<IEnumerable<YeuCauResponse>> LayDanhSachSinhVienAsync(Guid sinhVienId)
    {
        var list = await _yeuCauRepository.GetAllBySinhVienIdAsync(sinhVienId);
        return list.Select(MapListItem).ToList();
    }

    // Lấy toàn bộ danh sách yêu cầu cho cán bộ xử lý.
    public async Task<IEnumerable<YeuCauResponse>> LayDanhSachCanBoAsync()
    {
        var list = await _yeuCauRepository.GetAllAsync();
        return list.Select(MapListItem).ToList();
    }
    // Lấy chi tiết một yêu cầu gồm phản hồi, log và file.
    public async Task<YeuCauChiTietResponse> LayChiTietAsync(Guid id)
    {
        var x = await _yeuCauRepository.GetByIdAsync(id);
        if (x == null) throw new Exception("Không tìm thấy yêu cầu.");

        var response = new YeuCauChiTietResponse();
        FillBase(response, x);

        response.PhanHois = x.PhanHoiYeuCaus
            .OrderBy(p => p.CreatedAt)
            .Select(MapPhanHoi)
            .ToList();

        response.Logs = x.Logs
            .OrderBy(l => l.ThoiGian)
            .Select(l => new LogResponse
            {
                HanhDong = l.HanhDong,
                ThoiGian = l.ThoiGian
            })
            .ToList();

        response.Files = x.TaiNguyens
            .Where(f => f.IsActive)
            .Select(f => new FileResponse
            {
                Id = f.Id,
                TenFile = f.TenFile
            })
            .ToList();

        return response;
    }

    
    // CÁC THAO TÁC CẬP NHẬT — Dùng phương thức riêng cho từng loại entity
    // Không dùng navigation collection → tránh EF concurrency conflict
    

    // Xử lý sinh viên gửi lại yêu cầu khi cần bổ sung hồ sơ
    public async Task GuiLaiAsync(Guid id, Guid sinhVienId, List<string>? attachedFiles = null)
    {
        var yc = await _yeuCauRepository.GetByIdAsync(id);
        if (yc == null || yc.SinhVienId != sinhVienId) throw new Exception("Yêu cầu không hợp lệ.");
        if (yc.TrangThai != TrangThaiYeuCau.CAN_BO_SUNG) throw new Exception("Chỉ gửi lại khi trạng thái là cần bổ sung.");

        await _yeuCauRepository.UpdateStatusAsync(id, (int)TrangThaiYeuCau.DA_BO_SUNG);

        // Deactivate file cũ trước khi thêm file bổ sung
        await _yeuCauRepository.DeactivateTaiNguyensAsync(id);
        
        if (attachedFiles != null && attachedFiles.Any())
        {
            foreach (var fileName in attachedFiles.Where(x => !string.IsNullOrWhiteSpace(x)))
            {
                await _yeuCauRepository.AddTaiNguyenAsync(new TaiNguyen
                {
                    YeuCauId = id,
                    TenFile = fileName,
                    DuongDan = $"demo/{fileName}",
                    ContentType = "application/octet-stream"
                });
            }
        }

        await _yeuCauRepository.AddLogAsync(new LogYeuCauDichVu
        {
            YeuCauId = id,
            HanhDong = "Sinh viên/Cựu SV cập nhật hồ sơ",
            NguoiThucHienId = sinhVienId
        });

        await _notificationService.NotifyDataUpdateAsync();
    }

    // Cập nhật trạng thái tiếp nhận và bắt đầu xử lý cho cán bộ
    public async Task TiepNhanAsync(Guid id, Guid canBoId)
    {
        var yc = await _yeuCauRepository.GetByIdAsync(id);
        if (yc == null) throw new Exception("Không tìm thấy yêu cầu.");
        if (yc.TrangThai != TrangThaiYeuCau.SV_GUI && yc.TrangThai != TrangThaiYeuCau.MOT_CUA_NHAN && yc.TrangThai != TrangThaiYeuCau.DA_BO_SUNG)
            throw new Exception("Trạng thái không hợp lệ.");

        await _yeuCauRepository.UpdateStatusAsync(id, (int)TrangThaiYeuCau.MOT_CUA_DANG_XU_LY);
        await _yeuCauRepository.AddLogAsync(new LogYeuCauDichVu
        {
            YeuCauId = id,
            HanhDong = "Tiếp nhận & Bắt đầu xử lý",
            NguoiThucHienId = canBoId
        });

        await _notificationService.NotifyDataUpdateAsync();
    }

    // Cán bộ bắt đầu xử lý yêu cầu sau khi đã tiếp nhận.
    public async Task BatDauXuLyAsync(Guid id, Guid canBoId)
    {
        var yc = await _yeuCauRepository.GetByIdAsync(id);
        if (yc == null) throw new Exception("Không tìm thấy yêu cầu.");
        if (yc.TrangThai != TrangThaiYeuCau.MOT_CUA_NHAN && yc.TrangThai != TrangThaiYeuCau.SV_GUI && yc.TrangThai != TrangThaiYeuCau.DA_BO_SUNG)
            throw new Exception("Trạng thái không hợp lệ.");

        await _yeuCauRepository.UpdateStatusAsync(id, (int)TrangThaiYeuCau.MOT_CUA_DANG_XU_LY);
        await _yeuCauRepository.AddLogAsync(new LogYeuCauDichVu
        {
            YeuCauId = id,
            HanhDong = "Bắt đầu xử lý",
            NguoiThucHienId = canBoId
        });

        await _notificationService.NotifyDataUpdateAsync();
    }

    // Chuyển trạng thái yêu cầu sang cần bổ sung và gửi phản hồi cho sinh viên
    public async Task YeuCauBoSungAsync(Guid id, YeuCauBoSungRequest request, Guid canBoId)
    {
        var yc = await _yeuCauRepository.GetByIdAsync(id);
        if (yc == null) throw new Exception("Không tìm thấy yêu cầu.");
        if (yc.TrangThai != TrangThaiYeuCau.SV_GUI && yc.TrangThai != TrangThaiYeuCau.MOT_CUA_NHAN && yc.TrangThai != TrangThaiYeuCau.MOT_CUA_DANG_XU_LY && yc.TrangThai != TrangThaiYeuCau.DA_BO_SUNG)
            throw new Exception("Trạng thái không hợp lệ.");

        await _yeuCauRepository.UpdateStatusAsync(id, (int)TrangThaiYeuCau.CAN_BO_SUNG);
        await _yeuCauRepository.AddPhanHoiAsync(new PhanHoiYeuCau
        {
            YeuCauId = id,
            NguoiGuiType = LoaiNguoiDung.CAN_BO,
            NoiDung = $"Yêu cầu bổ sung: {request.LyDo}"
        });
        await _yeuCauRepository.AddLogAsync(new LogYeuCauDichVu
        {
            YeuCauId = id,
            HanhDong = "Yêu cầu bổ sung",
            NguoiThucHienId = canBoId
        });

        await _notificationService.NotifyDataUpdateAsync();
    }

    // Hoàn tất yêu cầu: sinh mật khẩu ngẫu nhiên, hash BCrypt, lưu vào DB, trả kết quả cho SV.
    public async Task HoanTatAsync(Guid id, HoanTatRequest request, Guid canBoId)
    {
        var yc = await _yeuCauRepository.GetByIdAsync(id);
        if (yc == null) throw new Exception("Không tìm thấy yêu cầu.");
        if (yc.TrangThai != TrangThaiYeuCau.MOT_CUA_DANG_XU_LY)
            throw new Exception("Trạng thái không hợp lệ.");

        var accountType = string.IsNullOrWhiteSpace(request.AccountType) ? "EMAIL" : request.AccountType!;
        var accountLabel = ResolveAccountLabel(accountType, request.AccountLabel);

        // Sinh mật khẩu ngẫu nhiên tại server
        var plainPassword = GenerateRandomPassword(12);

        // Hash mật khẩu bằng BCrypt trước khi lưu vào DB
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        await _nguoiDungRepository.UpdatePasswordAsync(yc.SinhVienId, accountType, hashedPassword);

        string content = request.PhuongThucXuLy == PhuongThucXuLy.AUTO
            ? "Hệ thống đã reset và gửi thông tin trực tiếp vào email cá nhân."
            : $"Đã reset thành công {accountLabel}. Mật khẩu mới là: {plainPassword}. Vui lòng đổi MK ngay sau khi đăng nhập.";

        await _yeuCauRepository.UpdateStatusAsync(id, (int)TrangThaiYeuCau.DA_HOAN_THANH);
        await _yeuCauRepository.AddPhanHoiAsync(new PhanHoiYeuCau
        {
            YeuCauId = id,
            NguoiGuiType = LoaiNguoiDung.CAN_BO,
            NoiDung = content,
            PhuongThucXuLy = request.PhuongThucXuLy
        });
        await _yeuCauRepository.AddLogAsync(new LogYeuCauDichVu
        {
            YeuCauId = id,
            HanhDong = "Phản hồi & Hoàn tất quy trình",
            NguoiThucHienId = canBoId
        });
        await _tinNhanRepository.AddAsync(new TinNhan
        {
            YeuCauId = id,
            LoaiTinNhan = LoaiTinNhan.EMAIL_SV,
            EmailNhan = yc.SinhVien?.Email ?? "unknown@huce.edu.vn",
            NoiDung = content,
            TrangThai = TrangThaiTinNhan.PENDING
        });

        await _notificationService.NotifyDataUpdateAsync();
    }

    
    // MAPPING HELPERS
    

    // Tạo DTO danh sách từ entity yêu cầu.
    private static YeuCauResponse MapListItem(YeuCauDichVu x)
    {
        var response = new YeuCauResponse();
        FillBase(response, x);
        return response;
    }

    // Đổ các trường dữ liệu chung từ entity sang response.
    private static void FillBase(YeuCauResponse response, YeuCauDichVu x)
    {
        var sv = x.SinhVien as SinhVien;
        var maSv = sv?.MaSinhVien ?? x.SinhVienId.ToString();
        var hoTen = x.SinhVien?.HoTen ?? string.Empty;

        response.Id = x.Id;
        response.MaYeuCau = x.MaYeuCau;
        response.MaDichVu = x.MaDichVu;
        response.TenDichVu = x.TenDichVu;
        response.ServiceName = x.TenDichVu;
        response.SinhVienName = hoTen;
        response.SinhVienIdText = maSv;
        response.StudentName = hoTen;
        response.StudentId = maSv;
        response.Lop = sv?.Lop ?? string.Empty;
        response.Khoa = sv?.Khoa ?? string.Empty;
        response.TrangThai = x.TrangThai;
        response.Status = (int)x.TrangThai;
        response.CreatedAt = x.CreatedAt;
        response.AttachedFiles = x.TaiNguyens.Where(t => t.IsActive).Select(t => t.TenFile).ToList();
        
        // Thông tin tài khoản sinh viên
        response.EmailSinhVien = x.SinhVien?.Email ?? string.Empty;
        response.TaiKhoanMicrosoft = sv?.TaiKhoanMicrosoft ?? string.Empty;
        response.TaiKhoanCongSV = sv?.TaiKhoanCongSV ?? string.Empty;
    }

    private static PhanHoiResponse MapPhanHoi(PhanHoiYeuCau p)
    {
        var password = ExtractPassword(p.NoiDung);
        var accountLabel = ExtractAccountLabel(p.NoiDung);
        var accountType = ResolveAccountType(accountLabel);
        var senderType = p.NguoiGuiType == LoaiNguoiDung.CAN_BO ? "CAN_BO" : "SINH_VIEN";

        return new PhanHoiResponse
        {
            Id = p.Id,
            ReqId = p.YeuCauId,
            NguoiGuiType = p.NguoiGuiType.ToString(),
            SenderType = senderType,
            NoiDung = p.NoiDung,
            Content = p.NoiDung,
            PhuongThucXuLy = p.PhuongThucXuLy,
            ResetMethod = p.PhuongThucXuLy == PhuongThucXuLy.AUTO ? "auto" : "manual",
            AccountType = accountType,
            AccountLabel = accountLabel,
            Password = password,
            CreatedAt = p.CreatedAt
        };
    }
   // Ưu tiên nhãn truyền vào, nếu không có thì tự suy ra theo loại tài khoản.
    private static string ResolveAccountLabel(string accountType, string? accountLabel)
    {
        if (!string.IsNullOrWhiteSpace(accountLabel)) return accountLabel;
        return accountType.ToUpperInvariant() switch
        {
            "OFFICE" => "Microsoft Office",
            "PORTAL" => "Cổng sinh viên",
            _ => "Email"
        };
    }
   // Tách mật khẩu mới từ nội dung phản hồi dạng text.
    private static string? ExtractPassword(string content)
    {
        var match = Regex.Match(content, @"Mật khẩu mới (?:là|của bạn là):\s*(?<pwd>[^.]+)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups["pwd"].Value.Trim() : null;
    }
    // Tách tên tài khoản đã reset từ nội dung phản hồi dạng text.
    private static string? ExtractAccountLabel(string content)
    {
        var match = Regex.Match(content, @"Đã reset thành công\s*(?<label>[^.]+)\.", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups["label"].Value.Trim() : null;
    }
// Ưu tiên nhãn truyền vào, nếu không có thì tự suy ra theo loại tài khoản.
    private static string? ResolveAccountType(string? accountLabel)
    {
        if (string.IsNullOrWhiteSpace(accountLabel)) return null;
        var normalized = accountLabel.ToLowerInvariant();
        if (normalized.Contains("office") || normalized.Contains("microsoft")) return "OFFICE";
        if (normalized.Contains("cổng") || normalized.Contains("portal")) return "PORTAL";
        return "EMAIL";
    }

    // Sinh mật khẩu ngẫu nhiên an toàn bằng cryptographic random.
    private static string GenerateRandomPassword(int length = 12)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
        var result = new char[length];
        var randomBytes = RandomNumberGenerator.GetBytes(length);
        for (int i = 0; i < length; i++)
        {
            result[i] = chars[randomBytes[i] % chars.Length];
        }
        return new string(result);
    }
}

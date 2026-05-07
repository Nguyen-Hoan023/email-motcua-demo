USE master;
GO

IF DB_ID('MotCuaDemoDb') IS NOT NULL
BEGIN
    ALTER DATABASE MotCuaDemoDb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE MotCuaDemoDb;
END
GO

CREATE DATABASE MotCuaDemoDb;
GO

USE MotCuaDemoDb;
GO

-- =========================================================
-- 1. SINH VIÊN
-- Không lưu password, không lưu EmailTruong.
-- Chỉ lưu thông tin hồ sơ sinh viên.
-- =========================================================
CREATE TABLE SinhVien (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Mssv NVARCHAR(20) NOT NULL UNIQUE,
    HoTen NVARCHAR(255) NOT NULL,
    Lop NVARCHAR(50),
    Khoa NVARCHAR(255),
    SoDienThoai NVARCHAR(20),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =========================================================
-- 2. CÁN BỘ
-- Không cần đăng nhập, nhưng vẫn lưu cán bộ xử lý/phê duyệt.
-- =========================================================
CREATE TABLE CanBo (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MaCanBo NVARCHAR(50) NOT NULL UNIQUE,
    HoTen NVARCHAR(255) NOT NULL,
    VaiTro NVARCHAR(255),
    Email NVARCHAR(255),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =========================================================
-- 3. DỊCH VỤ
-- Demo chỉ dùng DT01.
-- =========================================================
CREATE TABLE DichVu (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MaDichVu NVARCHAR(20) NOT NULL UNIQUE,
    TenDichVu NVARCHAR(255) NOT NULL,
    MoTa NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =========================================================
-- 4. LOẠI TÀI KHOẢN
-- Tương ứng ACCOUNT_TYPE_META và ACCOUNT_TYPE_ORDER.
-- =========================================================
CREATE TABLE LoaiTaiKhoan (
    AccountType NVARCHAR(20) PRIMARY KEY,
    Label NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    UsernameKey NVARCHAR(50),
    SortOrder INT NOT NULL
);
GO

-- =========================================================
-- 5. TÀI KHOẢN CỦA SINH VIÊN
-- Tương ứng STUDENT_DIRECTORY.accounts.
-- Mỗi sinh viên có 3 tài khoản:
-- EMAIL, OFFICE, PORTAL.
-- =========================================================
CREATE TABLE TaiKhoanSinhVien (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    Mssv NVARCHAR(20) NOT NULL,
    AccountType NVARCHAR(20) NOT NULL,

    Label NVARCHAR(100) NOT NULL,
    Username NVARCHAR(255) NOT NULL,
    Note NVARCHAR(500),

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_TaiKhoanSinhVien_SinhVien
        FOREIGN KEY (Mssv) REFERENCES SinhVien(Mssv),

    CONSTRAINT FK_TaiKhoanSinhVien_LoaiTaiKhoan
        FOREIGN KEY (AccountType) REFERENCES LoaiTaiKhoan(AccountType),

    CONSTRAINT UQ_TaiKhoanSinhVien_Mssv_AccountType
        UNIQUE (Mssv, AccountType)
);
GO

-- =========================================================
-- 6. YÊU CẦU DỊCH VỤ
-- Bảng chính lưu yêu cầu reset email/tài khoản.
-- =========================================================
CREATE TABLE YeuCauDichVu (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    MaDichVu NVARCHAR(20) NOT NULL DEFAULT 'DT01',

    Mssv NVARCHAR(20) NOT NULL,
    HoTenSinhVien NVARCHAR(255) NOT NULL,

    AccountType NVARCHAR(20) NOT NULL,
    AccountLabel NVARCHAR(100) NOT NULL,
    AccountUsername NVARCHAR(255) NOT NULL,

    NoiDung NVARCHAR(500) NOT NULL,
    LyDo NVARCHAR(1000),

    TrangThai NVARCHAR(50) NOT NULL DEFAULT 'DA_GUI',

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_YeuCauDichVu_SinhVien
        FOREIGN KEY (Mssv) REFERENCES SinhVien(Mssv),

    CONSTRAINT FK_YeuCauDichVu_DichVu
        FOREIGN KEY (MaDichVu) REFERENCES DichVu(MaDichVu),

    CONSTRAINT FK_YeuCauDichVu_LoaiTaiKhoan
        FOREIGN KEY (AccountType) REFERENCES LoaiTaiKhoan(AccountType)
);
GO

-- =========================================================
-- 7. TÀI NGUYÊN / FILE MINH CHỨNG
-- Nếu sinh viên upload file chứng minh thì lưu ở đây.
-- =========================================================
CREATE TABLE TaiNguyen (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    YeuCauId INT NOT NULL,

    TenFile NVARCHAR(255) NOT NULL,
    DuongDanFile NVARCHAR(500) NOT NULL,
    LoaiFile NVARCHAR(100),
    DungLuong BIGINT,

    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_TaiNguyen_YeuCauDichVu
        FOREIGN KEY (YeuCauId) REFERENCES YeuCauDichVu(Id)
);
GO

-- =========================================================
-- 8. KẾT QUẢ RESET EMAIL/TÀI KHOẢN
-- Lưu kết quả sau khi cán bộ phê duyệt.
-- Demo có thể lưu TemporaryPassword dạng text.
-- Bản thật nên mã hóa hoặc dùng link reset một lần.
-- =========================================================
CREATE TABLE KetQuaResetEmail (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    YeuCauId INT NOT NULL,

    AccountType NVARCHAR(20) NOT NULL,
    AccountLabel NVARCHAR(100) NOT NULL,
    AccountUsername NVARCHAR(255) NOT NULL,

    TemporaryPassword NVARCHAR(255) NOT NULL,

    CanBoId INT NULL,
    MaCanBo NVARCHAR(50),
    TenCanBoXuLy NVARCHAR(255),

    GhiChu NVARCHAR(1000),
    ApprovedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_KetQuaResetEmail_YeuCauDichVu
        FOREIGN KEY (YeuCauId) REFERENCES YeuCauDichVu(Id),

    CONSTRAINT FK_KetQuaResetEmail_CanBo
        FOREIGN KEY (CanBoId) REFERENCES CanBo(Id),

    CONSTRAINT FK_KetQuaResetEmail_LoaiTaiKhoan
        FOREIGN KEY (AccountType) REFERENCES LoaiTaiKhoan(AccountType)
);
GO

-- =========================================================
-- 9. LOG YÊU CẦU
-- Lưu lịch sử: tạo yêu cầu, phê duyệt, từ chối, hoàn thành.
-- =========================================================
CREATE TABLE LogYeuCauDichVu (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    YeuCauId INT NOT NULL,

    HanhDong NVARCHAR(255) NOT NULL,
    TrangThaiCu NVARCHAR(50),
    TrangThaiMoi NVARCHAR(50),

    NguoiThucHien NVARCHAR(255),
    LoaiNguoiThucHien NVARCHAR(50),

    NoiDung NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_LogYeuCauDichVu_YeuCauDichVu
        FOREIGN KEY (YeuCauId) REFERENCES YeuCauDichVu(Id)
);
GO
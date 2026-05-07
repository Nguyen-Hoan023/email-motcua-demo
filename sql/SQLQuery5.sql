USE MotCuaDemoDb;
GO

-- =========================================================
-- SINH VIÊN MẪU
-- Từ STUDENT_DIRECTORY['0009167']
-- =========================================================
INSERT INTO SinhVien
(Mssv, HoTen, Lop, Khoa, SoDienThoai)
VALUES
(
    '0009167',
    N'NGUYỄN HUY HOÀN',
    '67CNCS',
    N'Công nghệ thông tin',
    '0987 654 321'
);
GO

-- =========================================================
-- CÁN BỘ MẪU
-- Từ MOCK_AUTH_SERVER.officers.cb01
-- Không lưu password vì demo không cần đăng nhập.
-- =========================================================
INSERT INTO CanBo
(MaCanBo, HoTen, VaiTro, Email)
VALUES
(
    'cb01',
    N'Trần Văn A',
    N'Cán bộ Một Cửa',
    'cb01@huce.edu.vn'
);
GO

-- =========================================================
-- DỊCH VỤ DT01
-- =========================================================
INSERT INTO DichVu
(MaDichVu, TenDichVu, MoTa)
VALUES
(
    'DT01',
    N'Cấp lại/Reset email',
    N'Dịch vụ cấp lại mật khẩu tài khoản Email, Microsoft Office hoặc Cổng sinh viên'
);
GO

-- =========================================================
-- LOẠI TÀI KHOẢN
-- Từ ACCOUNT_TYPE_META và ACCOUNT_TYPE_ORDER
-- =========================================================
INSERT INTO LoaiTaiKhoan
(AccountType, Label, Description, UsernameKey, SortOrder)
VALUES
(
    'EMAIL',
    N'Email',
    N'Reset mật khẩu email nội bộ',
    'email',
    1
),
(
    'OFFICE',
    N'Microsoft Office',
    N'Reset tài khoản Microsoft Office 365',
    'office',
    2
),
(
    'PORTAL',
    N'Cổng sinh viên',
    N'Reset tài khoản cổng sinh viên',
    'portal',
    3
);
GO

-- =========================================================
-- 3 TÀI KHOẢN CỦA SINH VIÊN 0009167
-- Từ STUDENT_DIRECTORY.accounts
-- =========================================================
INSERT INTO TaiKhoanSinhVien
(Mssv, AccountType, Label, Username, Note)
VALUES
(
    '0009167',
    'EMAIL',
    N'Email',
    'hoannh@gmail.com',
    N'Tài khoản email sinh viên.'
),
(
    '0009167',
    'OFFICE',
    N'Microsoft Office',
    '0009167@st.huce.edu.vn',
    N'Tài khoản Microsoft Office.'
),
(
    '0009167',
    'PORTAL',
    N'Cổng sinh viên',
    '0009167',
    N'Tài khoản cổng thông tin sinh viên.'
);
GO




USE MotCuaDemoDb;
GO

SELECT * FROM SinhVien;
SELECT * FROM CanBo;
SELECT * FROM DichVu;
SELECT * FROM LoaiTaiKhoan ORDER BY SortOrder;
SELECT * FROM TaiKhoanSinhVien;


USE MotCuaDemoDb;
GO

SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

SELECT * FROM dbo.NguoiDungs;
SELECT * FROM dbo.Roles;
SELECT * FROM dbo.YeuCauDichVus;
SELECT * FROM dbo.PhanHoiYeuCaus;
SELECT * FROM dbo.TinNhans;
SELECT * FROM dbo.TaiNguyens;
SELECT * FROM dbo.LogYeuCauDichVus;
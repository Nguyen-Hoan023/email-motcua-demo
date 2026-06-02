# Hệ Thống Tiếp Nhận Yêu Cầu Một Cửa (MotCua Demo)

Dự án mô phỏng quy trình tiếp nhận và xử lý yêu cầu cấp lại mật khẩu (Email, Microsoft Office, Cổng thông tin) dành cho Sinh viên và Cán bộ Một Cửa. Hệ thống được tách biệt thành 2 cổng Frontend độc lập (Vue 3 + Vite + Pinia) kết nối với 1 Backend chung (ASP.NET Core API).

## Hướng Dẫn Chạy Dự Án

Hệ thống hoạt động với 3 terminal chạy song song:

### 1. Phía Backend API (ASP.NET Core)
Mở terminal 1 tại thư mục gốc và chạy:
```bash
cd motcua-backend/src/MotCua.API
dotnet run
```
*   **Địa chỉ API**: `http://localhost:5000`
*   **Tài liệu Swagger**: `http://localhost:5000/swagger`

### 2. Cổng Sinh Viên (Frontend)
Mở terminal 2 tại thư mục gốc và chạy:
```bash
cd fe-sinhvien
npm run dev
```
*   **Truy cập cổng Sinh Viên**: `http://localhost:3000`

### 3. Cổng Cán Bộ (Frontend)
Mở terminal 3 tại thư mục gốc và chạy:
```bash
cd fe-canbo
npm run dev
```
*   **Truy cập cổng Cán Bộ**: `http://localhost:3001`

### 4. Phía Background Worker (Tùy chọn - Xử lý gửi Email)
Để hệ thống thực hiện các tác vụ ngầm như gửi email thông báo sau khi hoàn tất:
```bash
cd motcua-backend/src/MotCua.Worker
dotnet run
```

---

## Tài Liệu API & Swagger

Hệ thống cung cấp giao diện Swagger để bạn có thể test trực tiếp các endpoint.

*   **Link Swagger**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
*   **Xóa dữ liệu Test**: Bạn có thể sử dụng endpoint `DELETE /api/system/reset-data` trong mục **System** để làm sạch toàn bộ yêu cầu cũ trong database.

### Các API Chính:

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **POST** | `/api/sv/yeu-cau` | Sinh viên gửi yêu cầu mới |
| **GET** | `/api/sv/yeu-cau` | Lấy danh sách yêu cầu của sinh viên hiện tại |
| **POST** | `/api/sv/yeu-cau/{id}/resubmit` | Sinh viên gửi lại file minh chứng bổ sung |
| **GET** | `/api/canbo/yeu-cau` | Cán bộ lấy danh sách yêu cầu chờ xử lý |
| **POST** | `/api/canbo/yeu-cau/{id}/tiep-nhan` | Cán bộ xác nhận tiếp nhận yêu cầu |
| **POST** | `/api/canbo/yeu-cau/{id}/yeu-cau-bo-sung` | Cán bộ yêu cầu sinh viên gửi thêm minh chứng |
| **POST** | `/api/canbo/yeu-cau/{id}/hoan-tat` | Cán bộ hoàn tất quy trình và gửi mật khẩu mới |
| **DELETE**| `/api/system/reset-data` | **(Debug)** Xóa sạch toàn bộ dữ liệu yêu cầu để test lại |

---

## Luồng Nghiệp Vụ Chính

### 1. Luồng Demo Hệ Thống (End-to-End)
1.  **Sinh viên (Port 3000)**: Truy cập trang chủ, điền form yêu cầu cấp lại mật khẩu và đính kèm file minh chứng.
2.  **Cán bộ (Port 3001)**: Nhận thông báo yêu cầu mới, nhấn **"Xử lý ngay"** để tiếp nhận.
3.  **Xử lý kỹ thuật**: 
    *   Nếu hồ sơ thiếu: Cán bộ nhấn **"Yêu cầu bổ sung"**. Sinh viên sẽ thấy thông báo và gửi lại file.
    *   Nếu hồ sơ chuẩn: Cán bộ chọn loại tài khoản cần reset. Hệ thống (Backend) tự động sinh mật khẩu ngẫu nhiên an toàn (12 ký tự), thực hiện mã hóa bằng **BCrypt** để lưu trữ vào DB, đồng thời lưu trực tiếp mật khẩu thô tạm thời (`MatKhauTamThoi`) và nhãn tài khoản (`AccountLabel`) vào các trường riêng biệt trong DB (bỏ hoàn toàn cơ chế bóc tách bằng Regex cũ).
4.  **Hoàn tất**: Cán bộ xác nhận "Kích hoạt reset & Hoàn tất".
5.  **Thông báo**: 
    *   Hệ thống chuyển trạng thái về **"Đã hoàn thành"**.
    *   Background Worker tự động quét và gửi Email mật khẩu mới cho sinh viên.
    *   Sinh viên xem được mật khẩu ngay trong phần **"Quá trình xử lý"** (Frontend hiển thị trực tiếp từ các trường cấu trúc trả về từ API).

### 2. Sơ Đồ Trạng Thái Yêu Cầu
- `1 (SV_GUI)`: Yêu cầu mới khởi tạo.
- `2 (MOT_CUA_NHAN)`: Bộ phận Một cửa đã nhận (Chờ xử lý).
- `3 (MOT_CUA_DANG_XU_LY)`: Đang trong quá trình xử lý kỹ thuật.
- `4 (CAN_BO_SUNG)`: Yêu cầu sinh viên gửi thêm minh chứng.
- `5 (DA_HOAN_THANH)`: Quy trình kết thúc thành công.

---

## Tài Khoản Demo (Hardcoded)

- **Sinh viên**: MSSV `0009167` (NGUYỄN HUY HOÀN)
- **Cán bộ**: Username `cb01` (Trần Văn A)

---

## XÓA DỮ LIỆU TEST (Cách thủ công qua DB)
```sql
USE MotCuaDemoDb;
GO 

DELETE FROM [LogYeuCauDichVus];
DELETE FROM [PhanHoiYeuCaus];
DELETE FROM [TaiNguyens];
DELETE FROM [TinNhans];
-- Xóa dữ liệu chính
DELETE FROM [YeuCauDichVus];
```

*Lưu ý: Thời gian hiển thị trên UI đã được tự động đồng bộ hóa giữa múi giờ Backend (UTC) và múi giờ Việt Nam (GMT+7).*

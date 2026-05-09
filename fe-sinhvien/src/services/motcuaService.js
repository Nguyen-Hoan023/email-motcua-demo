// SERVICE: motcuaService — Gọi Backend API (Cổng Sinh viên)

import { getAccountMeta } from '../constants/accountTypes';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_ROOT = `${API_BASE_URL}/api`;

// UTILS & HELPERS

// Format thời gian từ backend về dạng dd/MM/yyyy HH:mm cho giao diện.
const formatDateTime = (value) => {
  if (!value) return '';
  try {
    let dateStr = String(value);
    // Nếu backend trả về ISO không có 'Z', ta đính thêm để JS hiểu là UTC
    if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
      dateStr += 'Z';
    }

    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(value);

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return String(value);
  }
};

// Mapping tên dịch vụ sang metadata chuẩn của hệ thống.
const resolveServiceMeta = (serviceName) => {
  const mapping = {
    'Tài khoản Email': { maDichVu: 'DT01', tenDichVu: 'Cấp lại mật khẩu tài khoản Email' },
    'Tài khoản Microsoft Office': { maDichVu: 'DT01', tenDichVu: 'Cấp lại mật khẩu tài khoản Microsoft Office' },
    'Tài khoản cổng thông tin (sinhvien.huce.edu.vn)': {
      maDichVu: 'DT01',
      tenDichVu: 'Cấp lại mật khẩu tài khoản cổng thông tin (sinhvien.huce.edu.vn)',
    },
  };
  return mapping[serviceName] || { maDichVu: 'DT01', tenDichVu: serviceName };
};
// Chuẩn hóa trạng thái request từ backend về dạng số.
const normalizeStatus = (value) => {
  if (typeof value === 'number') return value;
  const n = Number(value);
  if (!Number.isNaN(n)) return n;
  const map = {
    SV_GUI: 1,
    MOT_CUA_NHAN: 2,
    MOT_CUA_DANG_XU_LY: 3,
    CAN_BO_SUNG: 4,
    DA_HOAN_THANH: 5,
    DA_BO_SUNG: 6,
  };
  return map[value] || 1;
};
// Chuẩn hóa object request để frontend sử dụng thống nhất.
const normalizeRequest = (r) => ({
  ...r,
  id: String(r.id ?? r.maYeuCau ?? ''),
  studentId: String(r.studentId ?? r.sinhVienIdText ?? r.maSinhVien ?? r.maSV ?? ''),
  studentName: r.studentName ?? r.sinhVienName ?? r.hoTenSinhVien ?? '',
  lop: r.lop ?? '',
  khoa: r.khoa ?? '',
  serviceName: r.serviceName ?? r.tenDichVu ?? '',
  status: normalizeStatus(r.status ?? r.trangThai ?? 1),
  createdAt: formatDateTime(r.createdAt ?? r.created_at ?? ''),
  attachedFiles: Array.isArray(r.attachedFiles)
    ? r.attachedFiles
    : Array.isArray(r.files)
      ? r.files.map((f) => f.tenFile || f.fileName || f.name || f)
      : [],
});
// Lấy label hiển thị theo loại tài khoản.
const accountLabelFromType = (accountType) => {
  const meta = getAccountMeta(accountType);
  return meta?.label || 'Tài khoản Email';
};
// Tách mật khẩu mới từ nội dung phản hồi.
const extractPassword = (content = '') => {
  const match = String(content).match(/Mật khẩu mới (?:là|của bạn là):\s*([^\.]+)/i);
  return match ? match[1].trim() : '';
};
// Tách tên tài khoản từ nội dung phản h
const extractAccountLabel = (content = '') => {
  const match = String(content).match(/Đã reset thành công\s*([^\.]+)\./i);
  return match ? match[1].trim() : '';
};
// Chuẩn hóa dữ liệu phản hồi từ backend.
const normalizePhanHoi = (ph, fallbackReqId = '') => {
  const content = ph.content ?? ph.noiDung ?? '';
  const accountType = ph.accountType || undefined;
  return {
    ...ph,
    reqId: String(ph.reqId ?? ph.yeuCauId ?? fallbackReqId),
    senderType: ph.senderType ?? ph.nguoiGuiType ?? 'CAN_BO',
    content,
    resetMethod: ph.resetMethod ?? (ph.phuongThucXuLy === 1 ? 'auto' : 'manual'),
    accountType,
    accountLabel: ph.accountLabel || extractAccountLabel(content) || (accountType ? accountLabelFromType(accountType) : undefined),
    password: ph.password || extractPassword(content),
    createdAt: formatDateTime(ph.createdAt ?? ''),
  };
};
// Hàm fetch dùng chung có xử lý lỗi API.
const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};


// INTERNAL: Lấy danh sách + chi tiết từ backend, normalize về format frontend

// Lấy và chuẩn hóa toàn bộ dữ liệu request từ backend.
const fetchAndNormalize = async () => {
  const listUrl = `${API_ROOT}/sv/yeu-cau`;
  const detailBase = `${API_ROOT}/sv/yeu-cau`;

  const data = await fetchJson(listUrl);
  const requests = Array.isArray(data) ? data : [];

  const details = await Promise.all(
    requests.map(async (r) => {
      const id = r.id ?? r.maYeuCau;
      if (!id) return r;
      try {
        return await fetchJson(`${detailBase}/${id}`);
      } catch {
        return r;
      }
    })
  );

  // Normalize requests
  const normalizedRequests = requests.map(normalizeRequest);

  // Tách phản hồi và log từ dữ liệu detail
  const phanHois = details.flatMap((detail) =>
    Array.isArray(detail?.phanHois)
      ? detail.phanHois.map((ph) => normalizePhanHoi(ph, detail.id))
      : []
  );
  const logs = details.flatMap((detail) =>
    Array.isArray(detail?.logs)
      ? detail.logs.map((log) => ({
        reqId: String(detail.id),
        action: log.hanhDong || log.action,
        time: formatDateTime(log.thoiGian || log.time)
      }))
      : []
  );

  return {
    YeuCauDichVu: normalizedRequests,
    PhanHoiYeuCau: phanHois,
    LogYeuCau: logs,
    TinNhan: [],
  };
};


// MAIN EXPORT SERVICES — Chỉ gọi Backend API phía Sinh viên

// Lấy danh sách yêu cầu của sinh viên.
export const fetchStudentRequests = async () => {
  return fetchAndNormalize();
};
// Tạo yêu cầu dịch vụ mới từ phía sinh viên.
export const createStudentRequest = async (serviceName, attachedFiles = []) => {
  const serviceMeta = resolveServiceMeta(serviceName);
  const result = await fetchJson(`${API_ROOT}/sv/yeu-cau`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      maDichVu: serviceMeta.maDichVu,
      tenDichVu: serviceMeta.tenDichVu,
      attachedFiles,
      taiNguyenIds: [],
    }),
  });
  return result;
};
// Sinh viên gửi lại hồ sơ sau khi bổ sung minh chứng.
export const resubmitRequest = async (id, files = []) => {
  await fetchJson(`${API_ROOT}/sv/yeu-cau/${id}/resubmit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attachedFiles: files }),
  });
  return true;
};

// Upload file thật lên server và nhận về tên file unique từ server.
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_ROOT}/files/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Upload file thất bại');
  }
  const data = await response.json();
  return data.tenFile; // Tên file unique trên server (có GUID prefix)
};

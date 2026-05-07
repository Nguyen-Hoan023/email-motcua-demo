// CONSTANTS: STATUS_MAP — Mapping trạng thái yêu cầu dịch vụ

export const STATUS_MAP = {
  1: { label: 'Đã gửi', color: 'text-[#eab308]', badge: 'bg-yellow-100 text-yellow-800' },
  2: { label: 'Đã tiếp nhận', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
  3: { label: 'Đang xử lý', color: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-800' },
  4: { label: 'Cần bổ sung', color: 'text-red-600', badge: 'bg-red-100 text-red-800' },
  5: { label: 'Đã hoàn thành', color: 'text-green-600', badge: 'bg-green-100 text-green-800' },
};

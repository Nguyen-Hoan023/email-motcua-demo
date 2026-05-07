
// UTILS: fileUtils — Các hàm tiện ích xử lý file


/**
 * Lấy phần mở rộng của tên file (lowercase).
 * @param {string} filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Cắt bỏ GUID prefix từ tên file server để hiển thị tên gốc.
 * Server lưu dạng: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_TenFileGoc.pdf"
 * Hàm trả về: "TenFileGoc.pdf"
 * @param {string} filename
 * @returns {string}
 */
export const getDisplayFileName = (filename) => {
  if (!filename) return '';
  // GUID pattern: 8-4-4-4-12 hex chars = 36 chars, theo sau bởi underscore
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
  return filename.replace(guidPattern, '');
};

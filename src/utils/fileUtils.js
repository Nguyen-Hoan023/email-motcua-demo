
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

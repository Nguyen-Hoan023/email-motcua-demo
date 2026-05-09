
import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Toast notification hiển thị ở góc trên phải màn hình.
 * @param {{ message: string }} props
 */
const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-24 right-8 bg-[#22c55e] text-white px-6 py-3 rounded shadow-xl flex items-center gap-2 z-[60] transition-all duration-500 border border-green-400">
      <CheckCircle size={20} />
      <span className="font-bold text-sm tracking-wide">{message}</span>
    </div>
  );
};

export default Toast;

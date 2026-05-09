
import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal wrapper chung. Children được render bên trong khung modal.
 * @param {{ onClose: () => void, title?: string, children: React.ReactNode, maxWidth?: string }} props
 */
const Modal = ({ onClose, title, children, maxWidth = 'max-w-[600px]' }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className={`bg-white rounded-lg shadow-2xl w-full ${maxWidth} overflow-hidden`}>
      <div className="flex justify-between items-center p-5 border-b">
        {title && <h3 className="text-xl font-bold text-[#1e3a8a]">{title}</h3>}
        <button
          onClick={onClose}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-full border-2 border-blue-200 text-blue-800 hover:bg-blue-50 transition"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;

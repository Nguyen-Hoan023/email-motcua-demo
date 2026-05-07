
// COMPONENTS: AppHeader — Header chung của toàn ứng dụng

import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { ASSETS } from '../constants/assets';

const AppHeader = () => (
  <header className="bg-white flex justify-between items-center py-4 px-10 border-b relative z-20">
    <div className="flex items-center gap-4">
      <img src={ASSETS.images.logos.main} alt="HUCE Logo" className="h-20 w-auto" />
      <div>
        <h1 className="text-xl font-bold text-[#1e3a8a] uppercase leading-tight">
          Trường Đại học Xây dựng Hà Nội
        </h1>
        <h2 className="text-lg font-semibold text-[#1e3a8a]">
          Hanoi University of Civil Engineering
        </h2>
        <p className="text-xs text-red-600 italic font-bold">
          Cơ sở giáo dục đại học đạt chuẩn kiểm định quốc tế
        </p>
      </div>
    </div>
    <div className="flex gap-10">
      <div className="flex items-center gap-3">
        <Phone className="text-[#f59e0b]" size={32} />
        <div>
          <p className="text-xs font-bold text-[#1e3a8a]">Hotline</p>
          <p className="text-sm font-semibold">02438697004</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="text-[#f59e0b]" size={32} />
        <div>
          <p className="text-xs font-bold text-[#1e3a8a]">Email</p>
          <p className="text-sm font-semibold">ctsv@huce.edu.vn</p>
        </div>
      </div>
    </div>
  </header>
);

export default AppHeader;

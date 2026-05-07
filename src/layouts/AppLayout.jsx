
// LAYOUTS: AppLayout — Wrapper layout chung

import React from 'react';

/**
 * Layout bao ngoài cho toàn bộ ứng dụng.
 * Hiện tại chỉ wrap với min-h-screen, sẵn sàng mở rộng thêm Providers.
 * @param {{ children: React.ReactNode }} props
 */
const AppLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col font-sans bg-gray-100">
    <div className="flex-1 flex flex-col transition-all">
      {children}
    </div>
  </div>
);

export default AppLayout;

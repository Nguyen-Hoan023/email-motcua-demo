// QUẢN LÝ TRẠNG THÁI DỮ LIỆU — Cổng Cán bộ

import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import * as motcuaService from '../services/motcuaService';

const EMPTY_DB = {
  YeuCauDichVu: [],
  PhanHoiYeuCau: [],
  LogYeuCau: [],
  TinNhan: [],
};

// Hardcoded demo users — không cần đăng nhập
const DEFAULT_OFFICER = {
  id: 'cb01',
  name: 'Trần Văn A',
  email: 'cb01@huce.edu.vn',
  role: 'Cán bộ Một Cửa',
  type: 'OFFICER',
  loaiNguoiDung: 1,
};

export function useOfficerSystem() {
  const [db, setDb] = useState(EMPTY_DB);
  const connectionRef = useRef(null);

  // Auth luôn authenticated, không cần loading
  const auth = {
    officer: {
      isAuthenticated: true,
      user: DEFAULT_OFFICER,
      loading: false,
    },
    loading: false,
  };

  // EXPORTED FUNCTIONS

  // Tải lại toàn bộ danh sách yêu cầu mới nhất từ Backend để cập nhật UI
  const refreshData = useCallback(async () => {
    try {
      const result = await motcuaService.fetchOfficerRequests();
      setDb(result);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ backend:', error);
    }
  }, []);

  // Thiết lập kết nối SignalR
  useEffect(() => {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/motcua`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => {
        console.log('SignalR Connected.');
        connection.on('ReceiveDataUpdate', () => {
          console.log('Nhận thông báo cập nhật dữ liệu từ Backend.');
          refreshData();
        });
      })
      .catch(err => console.error('SignalR Connection Error: ', err));

    // Initial load
    refreshData();

    return () => {
      connection.stop();
    };
  }, [refreshData]);

  // Xử lý hành động tiếp nhận/xử lý/hoàn tất của cán bộ
  const processRequest = async (id, actionType, payload = {}) => {
    try {
      await motcuaService.processOfficerRequest(id, actionType, payload);
      await refreshData();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  return {
    db,
    auth,
    processRequest,
    refreshData,
  };
}

// QUẢN LÝ TRẠNG THÁI DỮ LIỆU — Cổng Sinh viên

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
const DEFAULT_STUDENT = {
  id: '0009167',
  name: 'NGUYỄN HUY HOÀN',
  email: 'hoannh@huce.edu.vn',
  type: 'STUDENT',
  loaiNguoiDung: 0,
};

export function useStudentSystem() {
  const [db, setDb] = useState(EMPTY_DB);
  const connectionRef = useRef(null);

  // Auth luôn authenticated, không cần loading
  const auth = {
    student: {
      isAuthenticated: true,
      user: DEFAULT_STUDENT,
      loading: false,
    },
    loading: false,
  };

  // EXPORTED FUNCTIONS

  // Tải lại toàn bộ danh sách yêu cầu mới nhất từ Backend để cập nhật UI
  const refreshData = useCallback(async () => {
    try {
      const result = await motcuaService.fetchStudentRequests();
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


  // Xử lý tạo mới yêu cầu cho sinh viên
  // attachedFiles là mảng File objects, cần upload lên server trước
  const createRequest = async (serviceType, attachedFiles) => {
    try {
      // Upload từng file lên server, nhận về tên file unique
      const uploadedNames = await Promise.all(
        attachedFiles.map((f) => motcuaService.uploadFile(f))
      );
      await motcuaService.createStudentRequest(serviceType, uploadedNames);
      await refreshData();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  // Xử lý luồng sinh viên gửi lại yêu cầu khi bị cán bộ yêu cầu bổ sung
  // files là mảng File objects, cần upload lên server trước
  const resubmitRequest = async (id, files = []) => {
    try {
      // Upload từng file lên server, nhận về tên file unique
      const uploadedNames = await Promise.all(
        files.map((f) => motcuaService.uploadFile(f))
      );
      await motcuaService.resubmitRequest(id, uploadedNames);
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  return {
    db,
    auth,
    createRequest,
    resubmitRequest,
    refreshData,
  };
}

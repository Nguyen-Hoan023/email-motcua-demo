import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
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

export const useOfficerStore = defineStore('officer', () => {
  const db = ref(EMPTY_DB);
  let connectionRef = null;

  // Auth luôn authenticated, không cần loading
  const auth = reactive({
    officer: {
      isAuthenticated: true,
      user: DEFAULT_OFFICER,
      loading: false,
    },
    loading: false,
  });

  const refreshData = async () => {
    try {
      const result = await motcuaService.fetchOfficerRequests();
      db.value = result;
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ backend:', error);
    }
  };

  const setupSignalR = () => {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/motcua`)
      .withAutomaticReconnect()
      .build();

    connectionRef = connection;

    connection.start()
      .then(() => {
        console.log('SignalR Connected.');
        connection.on('ReceiveDataUpdate', () => {
          console.log('Nhận thông báo cập nhật dữ liệu từ Backend.');
          refreshData();
        });
      })
      .catch(err => console.error('SignalR Connection Error: ', err));

    refreshData();
  };

  const cleanupSignalR = () => {
    if (connectionRef) {
      connectionRef.stop();
    }
  };

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
    refreshData,
    setupSignalR,
    cleanupSignalR,
    processRequest,
  };
});

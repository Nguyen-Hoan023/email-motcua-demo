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

const DEFAULT_USER = {
  id: '0009167',
  name: 'NGUYỄN HUY HOÀN',
  email: '0009167@huce.edu.vn',
  role: 'Sinh viên',
  type: 'STUDENT',
  loaiNguoiDung: 0,
};

export const useStudentStore = defineStore('student', () => {
  const db = ref(EMPTY_DB);
  let connectionRef = null;

  const auth = reactive({
    student: {
      isAuthenticated: true,
      user: DEFAULT_USER,
      loading: false,
    },
    loading: false,
  });

  const refreshData = async () => {
    try {
      const result = await motcuaService.fetchStudentRequests(auth.student.user.id);
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

  const createRequest = async (serviceName, files) => {
    try {
      const attachedFiles = [];
      for (const f of files) {
        const uploadedName = await motcuaService.uploadFile(f);
        attachedFiles.push(uploadedName);
      }

      await motcuaService.createStudentRequest(serviceName, attachedFiles);
      await refreshData();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  const resubmitRequest = async (reqId, files) => {
    try {
      const attachedFiles = [];
      for (const f of files) {
        const uploadedName = await motcuaService.uploadFile(f);
        attachedFiles.push(uploadedName);
      }

      await motcuaService.resubmitRequest(reqId, attachedFiles);
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
    createRequest,
    resubmitRequest,
  };
});

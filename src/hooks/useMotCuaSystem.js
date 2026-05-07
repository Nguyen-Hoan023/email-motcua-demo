// QUẢN LÝ TRẠNG THÁI DỮ LIỆU , quản lý trạng thái toàn hệ thống

import { useState, useEffect, useCallback, useRef } from 'react';
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

const DEFAULT_OFFICER = {
  id: 'cb01',
  name: 'Trần Văn A',
  email: 'cb01@huce.edu.vn',
  role: 'Cán bộ Một Cửa',
  type: 'OFFICER',
  loaiNguoiDung: 1,
};

// Khoảng thời gian polling (ms) — cập nhật dữ liệu tự động
const POLL_INTERVAL = 5000;

export function useMotCuaSystem() {
  const [db, setDb] = useState(EMPTY_DB);
  // Lưu role hiện tại để polling đúng endpoint
  const currentRoleRef = useRef('STUDENT');

  // Auth luôn authenticated, không cần loading
  const auth = {
    student: {
      isAuthenticated: true,
      user: DEFAULT_STUDENT,
      loading: false,
    },
    officer: {
      isAuthenticated: true,
      user: DEFAULT_OFFICER,
      loading: false,
    },
    loading: false,
  };

  // EXPORTED FUNCTIONS

  // Tải lại toàn bộ danh sách yêu cầu mới nhất từ Backend để cập nhật UI
  const refreshData = useCallback(async (preferredRole = null) => {
    const role = preferredRole || currentRoleRef.current || 'STUDENT';
    currentRoleRef.current = role;

    try {
      const result = role === 'OFFICER'
        ? await motcuaService.fetchOfficerRequests()
        : await motcuaService.fetchStudentRequests();

      setDb(result);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ backend:', error);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Polling: tự động cập nhật dữ liệu mỗi POLL_INTERVAL ms
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
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
      await refreshData('STUDENT');
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  // Xử lý hành động tiếp nhận/xử lý/hoàn tất của cán bộ
  const processRequest = async (id, actionType, payload = {}) => {
    try {
      await motcuaService.processOfficerRequest(id, actionType, payload);
      await refreshData('OFFICER');
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
      await refreshData('STUDENT');
    } catch (error) {
      alert(error.message);
    }
  };

  return {
    db,
    auth,
    createRequest,
    resubmitRequest,
    processRequest,
    refreshData,
  };
}

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMotCuaSystem } from '../hooks/useMotCuaSystem';
import AppLayout from '../layouts/AppLayout';
import StudentApp from '../pages/student/StudentApp';
import OfficerApp from '../pages/officer/OfficerApp';

// Component con để detect route changes và refresh data theo role
const RouteAwareContent = ({ sysAPI }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/cb')) {
      sysAPI.refreshData('OFFICER');
    } else {
      sysAPI.refreshData('STUDENT');
    }
  }, [location.pathname, sysAPI]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sv" replace />} />

      <Route
        path="/sv"
        element={
          <StudentApp db={sysAPI.db} user={sysAPI.auth.student.user} sysAPI={sysAPI} />
        }
      />

      <Route
        path="/cb"
        element={
          <OfficerApp db={sysAPI.db} sysAPI={sysAPI} />
        }
      />
    </Routes>
  );
};

const AppRoutes = () => {
  const sysAPI = useMotCuaSystem();

  return (
    <BrowserRouter>
      <AppLayout>
        <RouteAwareContent sysAPI={sysAPI} />
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;

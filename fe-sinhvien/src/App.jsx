import React from 'react';
import { useStudentSystem } from './hooks/useStudentSystem';
import StudentApp from './pages/StudentApp';

export default function App() {
  const sysAPI = useStudentSystem();

  return (
    <StudentApp
      db={sysAPI.db}
      user={sysAPI.auth.student.user}
      sysAPI={sysAPI}
    />
  );
}

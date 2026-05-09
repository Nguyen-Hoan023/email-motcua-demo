import React from 'react';
import { useOfficerSystem } from './hooks/useOfficerSystem';
import OfficerApp from './pages/OfficerApp';

export default function App() {
  const sysAPI = useOfficerSystem();

  return <OfficerApp db={sysAPI.db} sysAPI={sysAPI} />;
}

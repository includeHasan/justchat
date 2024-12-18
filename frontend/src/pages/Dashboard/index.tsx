import { Routes, Route } from 'react-router-dom';
import UserManagement from './UserManagement';
import DataMigration from './DataMigration';

export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<UserManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/migration" element={<DataMigration />} />
    </Routes>
  );
}
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import AdminUsersPage from '@/pages/AdminUsersPage';

export default function AdminUsersRoute() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <AdminUsersPage />
    </AppLayout>
  );
}
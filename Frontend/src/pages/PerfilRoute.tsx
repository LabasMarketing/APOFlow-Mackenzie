import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import PerfilPage from '@/pages/PerfilPage';

export default function PerfilRoute() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <PerfilPage />
    </AppLayout>
  );
}

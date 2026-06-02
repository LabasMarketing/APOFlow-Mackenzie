import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import OrientadorDashboard from '@/pages/OrientadorDashboard';

export default function Pendencias() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <OrientadorDashboard compact />
    </AppLayout>
  );
}

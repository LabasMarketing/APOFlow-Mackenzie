import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import ComissaoDashboard from '@/pages/ComissaoDashboard';

export default function Votacao() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <ComissaoDashboard compact />
    </AppLayout>
  );
}

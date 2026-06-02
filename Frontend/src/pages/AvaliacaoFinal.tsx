import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import CoordenacaoDashboard from '@/pages/CoordenacaoDashboard';

export default function AvaliacaoFinal() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <CoordenacaoDashboard />
    </AppLayout>
  );
}

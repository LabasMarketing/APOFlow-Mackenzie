import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import Notificacoes from '@/pages/Notificacoes';

export default function NotificacoesRoute() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Notificacoes />
    </AppLayout>
  );
}

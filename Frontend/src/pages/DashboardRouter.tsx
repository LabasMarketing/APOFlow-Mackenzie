import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AlunoDashboard from '@/pages/AlunoDashboard';
import ComissaoDashboard from '@/pages/ComissaoDashboard';
import CoordenacaoDashboard from '@/pages/CoordenacaoDashboard';
import OrientadorDashboard from '@/pages/OrientadorDashboard';
import SecretariaDashboard from '@/pages/SecretariaDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  const dashboards = {
    admin: <AdminUsersPage />,
    aluno: <AlunoDashboard />,
    orientador: <OrientadorDashboard />,
    comissao: <ComissaoDashboard />,
    coordenacao: <CoordenacaoDashboard />,
    secretaria: <SecretariaDashboard />,
  };

  return <AppLayout>{dashboards[user.papel]}</AppLayout>;
}

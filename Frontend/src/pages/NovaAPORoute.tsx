import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import NovaAPO from '@/pages/NovaAPO';

export default function NovaAPORoute() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <NovaAPO />
    </AppLayout>
  );
}

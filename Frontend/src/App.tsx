import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import DashboardRouter from '@/pages/DashboardRouter';
import NovaAPORoute from '@/pages/NovaAPORoute';
import MinhasAPOs from '@/pages/MinhasAPOs';
import Pendencias from '@/pages/Pendencias';
import OrientadorAvaliadas from '@/pages/OrientadorAvaliadas';
import OrientadorAlunos from '@/pages/OrientadorAlunos';
import Votacao from '@/pages/Votacao';
import ComissaoItensAprovados from '@/pages/ComissaoItensAprovados';
import ComissaoItensDevolvidos from '@/pages/ComissaoItensDevolvidos';
import AvaliacaoFinal from '@/pages/AvaliacaoFinal';
import CoordenacaoAprovados from '@/pages/CoordenacaoAprovados';
import CoordenacaoEmpatesResolvidos from '@/pages/CoordenacaoEmpatesResolvidos';
import AdminUsersRoute from '@/pages/AdminUsersRoute';
import Lancamento from '@/pages/Lancamento';
import SecretariaFilaArquivamento from '@/pages/SecretariaFilaArquivamento';
import SecretariaAposLancadas from '@/pages/SecretariaAposLancadas';
import SecretariaAlunos from '@/pages/SecretariaAlunos';
import NotificacoesRoute from '@/pages/NotificacoesRoute';
import NotFound from '@/pages/NotFound';
import ChangePasswordRoute from '@/pages/ChangePasswordRoute';
import RegisterPage from '@/pages/RegisterPage';
import PerfilRoute from '@/pages/PerfilRoute';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/change-password" element={<ChangePasswordRoute />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/nova-apo" element={<NovaAPORoute />} />
            <Route path="/minhas-apos" element={<MinhasAPOs />} />
            <Route path="/pendencias" element={<Pendencias />} />
            <Route path="/avaliadas-orientador" element={<OrientadorAvaliadas />} />
            <Route path="/alunos-orientador" element={<OrientadorAlunos />} />
            <Route path="/votacao" element={<Votacao />} />
            <Route path="/itens-aprovados-comissao" element={<ComissaoItensAprovados />} />
            <Route path="/itens-devolvidos-comissao" element={<ComissaoItensDevolvidos />} />
            <Route path="/avaliacao-final" element={<AvaliacaoFinal />} />
            <Route path="/aprovados-coordenacao" element={<CoordenacaoAprovados />} />
            <Route path="/empates-resolvidos" element={<CoordenacaoEmpatesResolvidos />} />
            <Route path="/fila-arquivamento" element={<SecretariaFilaArquivamento />} />
            <Route path="/lancamento" element={<Lancamento />} />
            <Route path="/apos-lancadas" element={<SecretariaAposLancadas />} />
            <Route path="/alunos-secretaria" element={<SecretariaAlunos />} />
            <Route path="/usuarios" element={<AdminUsersRoute />} />
            <Route path="/notificacoes" element={<NotificacoesRoute />} />
            <Route path="/perfil" element={<PerfilRoute />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import {
  Archive,
  Bell,
  CheckSquare,
  ClipboardList,
  Download,
  FilePlus,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  User,
  Users,
  Vote,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/lib/mock-data';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { title: 'Usuários', url: '/usuarios', icon: Users },
    { title: 'Meu Perfil', url: '/perfil', icon: User },
  ],
  aluno: [
    { title: 'Painel', url: '/', icon: LayoutDashboard },
    { title: 'Nova APO', url: '/nova-apo', icon: FilePlus },
    { title: 'Minhas APOs', url: '/minhas-apos', icon: ClipboardList },
    { title: 'Meu Perfil', url: '/perfil', icon: User },
  ],
  orientador: [
    { title: 'Painel', url: '/', icon: LayoutDashboard },
    { title: 'Pendências', url: '/pendencias', icon: ClipboardList },
    { title: 'Avaliadas', url: '/avaliadas-orientador', icon: CheckSquare },
    { title: 'Alunos', url: '/alunos-orientador', icon: Users },
    { title: 'Meu Perfil', url: '/perfil', icon: User },
  ],
  comissao: [
    { title: 'Painel', url: '/', icon: LayoutDashboard },
    { title: 'Itens p/ Votação', url: '/votacao', icon: Vote },
    { title: 'Itens Aprovados', url: '/itens-aprovados-comissao', icon: CheckSquare },
    { title: 'Itens Devolvidos', url: '/itens-devolvidos-comissao', icon: RotateCcw },
    { title: 'Meu Perfil', url: '/perfil', icon: User },
  ],
  coordenacao: [
    { title: 'Painel', url: '/', icon: LayoutDashboard },
    { title: 'Avaliação Final', url: '/avaliacao-final', icon: ShieldCheck },
    { title: 'Aprovados', url: '/aprovados-coordenacao', icon: CheckCircle2 },
    { title: 'Empates Resolvidos', url: '/empates-resolvidos', icon: CheckSquare },
    { title: 'Meu Perfil', url: '/perfil', icon: User },
  ],
  secretaria: [
    { title: 'Painel', url: '/', icon: LayoutDashboard },
    { title: 'Fila de Arquivamento', url: '/fila-arquivamento', icon: Archive },
    { title: 'Fila de Lançamento', url: '/lancamento', icon: Download },
    { title: 'APOs Lançadas', url: '/apos-lancadas', icon: CheckCircle2 },
    { title: 'Alunos', url: '/alunos-secretaria', icon: Users },
    { title: 'Meu Perfil', url: '/perfil', icon: User },
  ],
};

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  aluno: 'Aluno',
  orientador: 'Orientador',
  comissao: 'Comissão',
  coordenacao: 'Coordenação',
  secretaria: 'Secretaria',
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout, switchProfessorRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const items = navByRole[user.papel];
  const availableProfessorRoles = user.papeis.filter((entry) => ['orientador', 'coordenacao'].includes(entry));
  const canSwitchProfessorRole = availableProfessorRoles.length > 1;

  const changeRole = (nextRole: Role) => {
    switchProfessorRole(nextRole);
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {!collapsed && <span className="font-display font-semibold">APOFlow</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="font-body text-xs text-sidebar-foreground/60">Logado como</p>
            <p className="truncate font-display text-sm font-semibold text-sidebar-foreground">{user.nome}</p>
            <p className="font-body text-xs text-sidebar-primary">{roleLabels[user.papel]}</p>
            {canSwitchProfessorRole && (
              <div className="mt-2 space-y-1">
                <p className="font-body text-[11px] text-sidebar-foreground/60">Trocar perfil</p>
                <select
                  className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar px-2 text-xs text-sidebar-foreground"
                  value={user.papel}
                  onChange={(event) => changeRole(event.target.value as Role)}
                >
                  {availableProfessorRoles.includes('orientador') && <option value="orientador">Orientador</option>}
                  {availableProfessorRoles.includes('coordenacao') && <option value="coordenacao">Coordenação</option>}
                </select>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:bg-white hover:text-accent font-medium"
          onClick={logout}
          title={`Sair da sessão atual (${location.pathname})`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Sair'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

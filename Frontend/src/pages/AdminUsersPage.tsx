import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { deleteUser, getUsers, queryKeys, type AdminUser, updateUserRoles } from '@/lib/api';
import type { Role } from '@/lib/mock-data';
import { toast } from 'sonner';

const ASSIGNABLE_ROLES: Role[] = ['aluno', 'orientador', 'comissao', 'coordenacao', 'secretaria'];

const FILTER_OPTIONS: Array<{ value: 'todos' | Role; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'aluno', label: 'Aluno' },
  { value: 'orientador', label: 'Orientador' },
  { value: 'comissao', label: 'Comissão' },
  { value: 'coordenacao', label: 'Coordenação' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'admin', label: 'Admin' },
];

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  aluno: 'Aluno',
  orientador: 'Orientador',
  comissao: 'Comissão',
  coordenacao: 'Coordenação',
  secretaria: 'Secretaria',
};

function getNextRoles(current: Role[], role: Role): Role[] {
  const normalized = current.filter((item) => item !== 'admin');

  if (role === 'aluno') {
    return ['aluno'];
  }

  if (role === 'secretaria') {
    return normalized.includes('secretaria') ? ['aluno'] : ['secretaria'];
  }

  if (role === 'coordenacao') {
    if (normalized.includes('coordenacao')) {
      return normalized.includes('orientador') ? ['orientador'] : ['aluno'];
    }

    if (normalized.includes('orientador')) {
      return ['orientador', 'coordenacao'];
    }

    return ['coordenacao'];
  }

  if (role === 'orientador') {
    if (normalized.includes('orientador')) {
      return normalized.includes('coordenacao') ? ['coordenacao'] : ['aluno'];
    }

    if (normalized.includes('coordenacao')) {
      return ['orientador', 'coordenacao'];
    }

    return ['orientador'];
  }

  if (role === 'comissao') {
    return normalized.includes('comissao') ? ['aluno'] : ['comissao'];
  }

  return ['aluno'];
}

function getRoleSummary(roles: Role[]): string {
  const normalized = roles.filter((role) => role !== 'admin');

  if (normalized.includes('orientador') && normalized.includes('coordenacao')) {
    return 'Orientador e Coordenação';
  }

  return roleLabels[normalized[0] ?? 'aluno'];
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draftRoles, setDraftRoles] = useState<Record<string, Role[]>>({});
  const [draftOrientadores, setDraftOrientadores] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | Role>('todos');

  const { data: users, isLoading } = useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers,
    enabled: user?.papeis.includes('admin') ?? false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, papeis, orientadorId }: { userId: string; papeis: Role[]; orientadorId?: string | null }) => updateUserRoles(userId, papeis, orientadorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('Perfis atualizados com sucesso.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfis.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('Usuário excluído com sucesso.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir usuário.');
    },
  });

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const sourceUsers = users ?? [];

    return sourceUsers.filter((entry) => {
      const matchesSearch = normalizedSearch.length === 0
        || entry.nome.toLowerCase().includes(normalizedSearch)
        || entry.email.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === 'todos' || entry.papeis.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  if (!user?.papeis.includes('admin')) {
    return <div className="p-6 font-body text-sm text-muted-foreground">Acesso restrito ao administrador.</div>;
  }

  if (isLoading || !users) {
    return <div className="p-6 font-body text-sm text-muted-foreground">Carregando usuários...</div>;
  }

  const resolveRoles = (entry: AdminUser) => draftRoles[entry.id] ?? entry.papeis;
  const resolveOrientadorId = (entry: AdminUser) => draftOrientadores[entry.id] ?? entry.orientadorId ?? '';
  const orientadoresDisponiveis = users.filter((entry) => entry.papeis.includes('orientador'));

  const toggleRole = (entry: AdminUser, role: Role) => {
    setDraftRoles((prev) => ({
      ...prev,
      [entry.id]: getNextRoles(resolveRoles(entry), role),
    }));
  };

  const saveRoles = (entry: AdminUser) => {
    const papeis = resolveRoles(entry);
    if (papeis.length === 0) {
      toast.error('Selecione ao menos um perfil.');
      return;
    }
    const orientadorId = papeis.includes('aluno') ? resolveOrientadorId(entry) || null : null;
    updateMutation.mutate({ userId: entry.id, papeis, orientadorId });
  };

  const removeUser = (entry: AdminUser) => {
    const confirmed = window.confirm(`Excluir o usuário ${entry.nome} (${entry.email})? Esta ação não pode ser desfeita.`);
    if (!confirmed) {
      return;
    }
    deleteMutation.mutate(entry.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de usuários</h1>
          <p className="font-body text-sm text-muted-foreground">Lista completa de pessoas cadastradas com e-mail e perfil atual.</p>
        </div>
      </div>

      <Card className="shadow-card">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-1.5">
            <p className="font-display text-sm font-semibold text-foreground">Buscar usuário</p>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrar por nome ou e-mail"
            />
          </div>
          <div className="space-y-1.5 md:w-64">
            <p className="font-display text-sm font-semibold text-foreground">Perfil</p>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'todos' | Role)}
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.map((entry) => {
          const selectedRoles = resolveRoles(entry);
          const isFixedAdmin = entry.papeis.includes('admin');
          const summaryLabel = isFixedAdmin ? roleLabels.admin : getRoleSummary(selectedRoles);

          return (
            <Card key={entry.id} className="shadow-card">
              <CardHeader className="gap-2">
                <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base font-display">
                  <span>{entry.nome}</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {summaryLabel}
                  </span>
                </CardTitle>
                <p className="font-body text-sm text-muted-foreground">{entry.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {entry.drt && <span className="rounded-full bg-muted px-3 py-1">DRT: {entry.drt}</span>}
                </div>

                <div className="space-y-2">
                  <p className="font-display text-sm font-semibold text-foreground">Perfis atribuídos</p>
                  {isFixedAdmin ? (
                    <p className="font-body text-sm text-muted-foreground">Conta administrativa fixa.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {ASSIGNABLE_ROLES.map((role) => {
                        const checked = selectedRoles.includes(role);
                        return (
                          <label key={role} className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleRole(entry, role)}
                            />
                            <span>{roleLabels[role]}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {!isFixedAdmin && selectedRoles.includes('aluno') && (
                  <div className="max-w-md space-y-1.5">
                    <p className="font-display text-sm font-semibold text-foreground">Orientador</p>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={resolveOrientadorId(entry)}
                      onChange={(event) => setDraftOrientadores((prev) => ({ ...prev, [entry.id]: event.target.value }))}
                    >
                      <option value="">Sem orientador definido</option>
                      {orientadoresDisponiveis.map((orientador) => (
                        <option key={orientador.id} value={orientador.id}>{orientador.nome}</option>
                      ))}
                    </select>
                    <p className="font-body text-xs text-muted-foreground">
                      O aluno terá apenas um orientador. Orientadores podem acompanhar múltiplos alunos.
                    </p>
                  </div>
                )}

                {!isFixedAdmin && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-body text-xs text-muted-foreground">
                      Estados permitidos: aluno, orientador, comissão, orientador com coordenação, coordenação ou secretaria.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => removeUser(entry)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                      <Button
                        onClick={() => saveRoles(entry)}
                        disabled={updateMutation.isPending}
                      >
                        Salvar perfis
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredUsers.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="pt-6 font-body text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros atuais.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

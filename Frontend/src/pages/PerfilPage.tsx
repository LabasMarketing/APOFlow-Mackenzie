import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAccount, getProfile, updateProfile } from '@/lib/api';
import { toast } from 'sonner';

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!user,
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const getValue = (field: string, fallback: string | number | null | undefined) =>
    form[field] !== undefined ? form[field] : (fallback ?? '');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, string | null> = {};
      for (const [key, val] of Object.entries(form)) {
        payload[key] = val;
      }
      return updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setForm({});
      toast.success('Perfil atualizado com sucesso.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar perfil.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('Conta excluída.');
      logout();
      navigate('/');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir conta.');
    },
  });

  if (isLoading || !profile) {
    return <div className="p-6 text-muted-foreground font-body text-sm">Carregando perfil...</div>;
  }

  const isProfessor = ['orientador', 'comissao', 'coordenacao', 'secretaria'].includes(profile.papel);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Meu Perfil</h1>
        <p className="font-body text-sm text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar */}
      <Card className="shadow-card">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="relative">
            {profile.fotoUrl || form['fotoUrl'] ? (
              <img
                src={(form['fotoUrl'] as string) || profile.fotoUrl!}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-display font-bold text-muted-foreground border-2 border-border">
                {profile.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
              <Camera className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">{profile.nome}</p>
            <p className="font-body text-sm text-muted-foreground">{profile.email}</p>
            <p className="font-body text-xs text-primary capitalize">{profile.papel}</p>
            {profile.papeis.includes('aluno') && (
              <p className="mt-1 font-body text-xs text-foreground">
                <span className="text-primary">Orientador: </span>
                {profile.orientadorNome ?? 'Não definido'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-display">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-display text-sm">Nome completo</Label>
            <Input value={getValue('nome', profile.nome) as string} onChange={set('nome')} placeholder="Nome completo" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-display text-sm">URL da foto de perfil</Label>
            <Input value={getValue('fotoUrl', profile.fotoUrl) as string} onChange={set('fotoUrl')} placeholder="https://..." />
          </div>

          {isProfessor && (
            <div className="space-y-1.5">
              <Label className="font-display text-sm">DRT</Label>
              <Input value={getValue('drt', profile.drt) as string} onChange={set('drt')} placeholder="Ex: 123456" />
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || Object.keys(form).length === 0}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardContent>
      </Card>

      {/* Zona de perigo */}
      <Card className="shadow-card border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base font-display text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-body text-sm text-muted-foreground">
            A exclusão da conta é permanente e remove todos os seus dados. Esta ação não pode ser desfeita.
          </p>
          {!confirmDelete ? (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir minha conta
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar exclusão'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

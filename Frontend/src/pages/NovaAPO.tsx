import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { createApo, getApos, queryKeys, resubmitApo, saveApoDraft } from '@/lib/api';
import { getPontosByTipo, tiposAPO } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function NovaAPO() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pontos, setPontos] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [tipo, setTipo] = useState('');
  const [isLoadedFromEdit, setIsLoadedFromEdit] = useState(false);

  const editingApoId = searchParams.get('editar');
  const editingApo = useMemo(
    () => apos.find((entry) => entry.id === editingApoId && entry.alunoId === user?.id),
    [apos, editingApoId, user?.id],
  );

  useEffect(() => {
    setIsLoadedFromEdit(false);
  }, [editingApoId]);

  useEffect(() => {
    if (!editingApo || isLoadedFromEdit) {
      return;
    }

    setTitulo(editingApo.titulo);
    setDescricao(editingApo.descricao);
    setPontos(String(editingApo.pontos));
    setFiles(editingApo.anexos);
    setTipo(editingApo.tipo);
    setIsLoadedFromEdit(true);
  }, [editingApo, isLoadedFromEdit]);

  const createMutation = useMutation({
    mutationFn: createApo,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.apos }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user?.id ?? '') }),
      ]);
      toast.success('APO submetida com sucesso!', { description: 'Seu orientador recebera uma notificacao.' });
      navigate('/minhas-apos');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel submeter a APO.');
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: saveApoDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      toast.success('Rascunho salvo com sucesso.');
      navigate('/minhas-apos');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel salvar o rascunho.');
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: ({ apoId, payload }: { apoId: string; payload: Parameters<typeof createApo>[0] }) => resubmitApo(apoId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.apos }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user?.id ?? '') }),
      ]);
      toast.success('APO editada e reenviada com sucesso.');
      navigate('/minhas-apos');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel reenviar a APO.');
    },
  });

  const addFile = () => {
    setFiles((previous) => [...previous, `documento_${previous.length + 1}.pdf`]);
    toast.success('Arquivo adicionado (simulado)');
  };

  const removeFile = (index: number) => setFiles((previous) => previous.filter((_, current) => current !== index));

  const handleTipoChange = (nextTipo: string) => {
    setTipo(nextTipo);

    const pontosSugeridos = getPontosByTipo(nextTipo);
    setPontos(pontosSugeridos ? String(pontosSugeridos) : '');
  };

  const getPayload = () => ({
    alunoId: user!.id,
    titulo,
    tipo,
    descricao,
    pontos: Number(pontos),
    anexos: files,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Sessao invalida. Faça login novamente.');
      return;
    }

    if (files.length === 0) {
      toast.error('Adicione pelo menos um anexo para submeter a APO.');
      return;
    }

    if (editingApoId) {
      resubmitMutation.mutate({ apoId: editingApoId, payload: getPayload() });
      return;
    }

    createMutation.mutate(getPayload());
  };

  const handleSaveDraft = () => {
    if (!user) {
      toast.error('Sessao invalida. Faça login novamente.');
      return;
    }

    saveDraftMutation.mutate(getPayload());
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{editingApoId ? 'Editar APO devolvida' : 'Nova APO'}</h1>
        <p className="font-body text-sm text-muted-foreground">
          {editingApoId ? 'Ajuste os dados e reenvie para o orientador.' : 'Preencha os dados da atividade e anexe as evidências'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display">Dados da Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-display text-sm">Título</Label>
              <Input placeholder="Ex: Artigo publicado na IEEE..." value={titulo} onChange={(event) => setTitulo(event.target.value)} required />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-display text-sm">Tipo de Atividade</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={tipo}
                  onChange={(event) => handleTipoChange(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {tiposAPO.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-sm">Pontos</Label>
                <Input type="number" min={1} max={6} placeholder="Selecione o tipo" value={pontos} readOnly required />
                <p className="text-xs text-muted-foreground">A pontuação é preenchida automaticamente conforme o tipo de atividade.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-sm">Descrição</Label>
              <Textarea placeholder="Descreva a atividade realizada..." rows={4} value={descricao} onChange={(event) => setDescricao(event.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display">Anexos / Evidências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file, index) => (
              <div key={file} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-body">{file}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={addFile}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Arquivo (simulado)
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/minhas-apos')}>
            Cancelar
          </Button>
          {!editingApoId && (
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saveDraftMutation.isPending || createMutation.isPending}>
              Salvar como rascunho
            </Button>
          )}
          <Button
            type="submit"
            className="bg-gradient-primary font-display font-semibold text-primary-foreground"
            disabled={createMutation.isPending || resubmitMutation.isPending || saveDraftMutation.isPending}
          >
            {editingApoId ? 'Reenviar APO' : 'Submeter APO'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

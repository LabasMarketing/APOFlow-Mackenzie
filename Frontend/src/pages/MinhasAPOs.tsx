import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, giveUpApo, queryKeys } from '@/lib/api';
import type { APORecord } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function MinhasAPOs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allApos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });

  const giveUpMutation = useMutation({
    mutationFn: giveUpApo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      toast.success('APO marcada como desistida.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel desistir da APO.');
    },
  });

  if (!user) {
    return <LoginPage />;
  }

  const apos = allApos.filter((entry) => entry.alunoId === user.id);
  const rascunhos = apos.filter((entry) => entry.status === 'rascunho');
  const enviadas = apos.filter((entry) => entry.status !== 'rascunho' && entry.status !== 'desistida');
  const desistidas = apos.filter((entry) => entry.status === 'desistida');
  const pendentes = enviadas.filter((entry) =>
    ['devolvida', 'em_avaliacao_orientador', 'em_avaliacao_comissao', 'em_avaliacao_coordenacao'].includes(entry.status)
  );
  const aprovadas = enviadas.filter((entry) => entry.status === 'aprovado');
  const arquivadas = enviadas.filter((entry) => entry.status === 'arquivado');
  const lancadas = enviadas.filter((entry) => entry.status === 'lancado');
  const pontosTotais = enviadas.reduce((total, current) => total + current.pontos, 0);

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Minhas APOs</h1>
          <p className="font-body text-sm text-muted-foreground">Atividades enviadas, devolvidas e rascunhos</p>
        </div>
        <Card className="shadow-card">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Pontos das atividades correspondentes</h2>
              <span className="text-sm font-display font-semibold text-accent">Total: {pontosTotais} pt</span>
            </div>
            <div className="space-y-1">
              {enviadas.map((apo) => (
                <div key={apo.id} className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2 text-sm">
                  <span className="truncate">{apo.titulo}</span>
                  <span className="shrink-0 font-display font-semibold">{apo.pontos} pt</span>
                </div>
              ))}
              {enviadas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma APO enviada ainda.</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="border-b px-6 py-4">
              <h2 className="font-display text-base font-semibold">Rascunhos</h2>
            </div>
            <div className="divide-y">
              {rascunhos.map((apo) => (
                <ApoItem key={apo.id} apo={apo}>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/nova-apo?editar=${apo.id}`)}>
                    Editar
                  </Button>
                </ApoItem>
              ))}
              {rascunhos.length === 0 && <div className="p-6 text-center font-body text-sm text-muted-foreground">Nenhum rascunho salvo.</div>}
            </div>
          </CardContent>
        </Card>
        <ApoSection title="APOs pendentes" emptyMessage="Nenhuma APO pendente.">
          {pendentes.map((apo) => (
            <ApoItem key={apo.id} apo={apo}>
              {apo.status === 'devolvida' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/nova-apo?editar=${apo.id}`)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => giveUpMutation.mutate(apo.id)}>
                    Desistir
                  </Button>
                </>
              )}
            </ApoItem>
          ))}
        </ApoSection>

        <ApoSection title="APOs aprovadas" emptyMessage="Nenhuma APO aprovada.">
          {aprovadas.map((apo) => (
            <ApoItem key={apo.id} apo={apo} />
          ))}
        </ApoSection>

        <ApoSection title="APOs arquivadas" emptyMessage="Nenhuma APO arquivada.">
          {arquivadas.map((apo) => (
            <ApoItem key={apo.id} apo={apo} />
          ))}
        </ApoSection>

        <ApoSection title="APOs lançadas" emptyMessage="Nenhuma APO lançada.">
          {lancadas.map((apo) => (
            <ApoItem key={apo.id} apo={apo} />
          ))}
        </ApoSection>

        <ApoSection title="APOs desistidas" emptyMessage="Nenhuma APO desistida.">
          {desistidas.map((apo) => (
            <ApoItem key={apo.id} apo={apo} />
          ))}
        </ApoSection>
      </div>
    </AppLayout>
  );
}

function ApoSection({ title, emptyMessage, children }: { title: string; emptyMessage: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const hasItems = Array.isArray(items) ? items.length > 0 : Boolean(items);

  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        <div className="border-b px-6 py-4">
          <h2 className="font-display text-base font-semibold">{title}</h2>
        </div>
        <div className="divide-y">
          {hasItems ? items : <div className="p-8 text-center font-body text-sm text-muted-foreground">{emptyMessage}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function ApoItem({ apo, children }: { apo: APORecord; children?: React.ReactNode }) {
  return (
    <Dialog>
      <div className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary/30">
        <DialogTrigger asChild>
          <button className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-display font-medium">{apo.titulo}</p>
              <p className="font-body text-xs text-muted-foreground">{apo.tipo} • {apo.pontos} pt • {apo.dataAtualizacao}</p>
            </div>
          </button>
        </DialogTrigger>
        <div className="flex shrink-0 items-center gap-2">
          {apo.anexos.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" /> {apo.anexos.length}
            </span>
          )}
          <StatusBadge status={apo.status} />
          {children}
        </div>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">{apo.titulo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="font-display font-semibold">{apo.tipo}</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Pontos</p>
              <p className="font-display font-semibold">{apo.pontos} pt</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Data de atualização</p>
              <p className="font-display font-semibold">{apo.dataAtualizacao}</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="mb-1 text-xs text-muted-foreground">Status</p>
              <StatusBadge status={apo.status} />
            </div>
          </div>

          <div className="rounded-lg bg-secondary/30 p-4">
            <p className="mb-2 text-xs text-muted-foreground">Descrição</p>
            <p className="text-sm leading-6 text-foreground">{apo.descricao}</p>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Anexos</p>
            <div className="space-y-2">
              {apo.anexos.map((anexo) => (
                <div key={anexo} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span>{anexo}</span>
                </div>
              ))}
              {apo.anexos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum anexo enviado.</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

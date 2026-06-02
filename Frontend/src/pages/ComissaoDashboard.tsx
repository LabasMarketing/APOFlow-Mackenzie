import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, FileText, RotateCcw, ThumbsDown, ThumbsUp, Vote } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, queryKeys, voteApo } from '@/lib/api';
import { APORecord } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function ComissaoDashboard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos });
  const itens = apos.filter((entry) => entry.status === 'em_avaliacao_comissao');

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{compact ? 'Itens para Votação' : 'Painel da Comissão'}</h1>
        <p className="font-body text-sm text-muted-foreground">
          {compact ? 'APOs aguardando seu voto na comissão' : 'Itens para avaliação e votação'}
        </p>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-warning"><Vote className="h-5 w-5" /></div>
              <div><p className="font-body text-xs text-muted-foreground">Aguardando Voto</p><p className="text-xl font-display font-bold">{itens.length}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-success"><ThumbsUp className="h-5 w-5" /></div>
              <div><p className="font-body text-xs text-muted-foreground">Aprovados (mês)</p><p className="text-xl font-display font-bold">5</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-destructive"><ThumbsDown className="h-5 w-5" /></div>
              <div><p className="font-body text-xs text-muted-foreground">Devolvidos</p><p className="text-xl font-display font-bold">1</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {itens.map((apo, index) => (
          <motion.div key={apo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            {user && <VotacaoCard apo={apo} memberName={user.nome} />}
          </motion.div>
        ))}
        {itens.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center font-body text-muted-foreground">Nenhum item pendente de votação.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function VotacaoCard({ apo, memberName }: { apo: APORecord; memberName: string }) {
  const [justificativa, setJustificativa] = useState('');
  const queryClient = useQueryClient();
  const justificativaPreenchida = justificativa.trim().length > 0;

  const voteMutation = useMutation({
    mutationFn: (decisao: 'aprovar' | 'reprovar' | 'devolver') => voteApo(apo.id, { membro: memberName, decisao, justificativa: justificativa.trim() }),
    onSuccess: async (_, decisao) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      toast.success(`Voto "${decisao}" registrado para "${apo.titulo}".`);
      setJustificativa('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel registrar o voto.');
    },
  });

  const votar = (decisao: 'aprovar' | 'reprovar' | 'devolver') => {
    if (!justificativaPreenchida) {
      toast.error('Adicione uma justificativa antes de registrar o voto.');
      return;
    }

    voteMutation.mutate(decisao);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-base font-display">{apo.titulo}</CardTitle>
            <p className="mt-1 font-body text-xs text-muted-foreground">{apo.aluno} • {apo.tipo} • {apo.pontos} pt</p>
          </div>
          <StatusBadge status={apo.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-body text-sm text-muted-foreground">{apo.descricao}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
          <div>
            <p className="text-xs font-display font-semibold text-foreground">Arquivos vinculados</p>
            <p className="font-body text-xs text-muted-foreground">
              {apo.anexos.length > 0 ? `${apo.anexos.length} arquivo(s) atrelado(s) a esta APO.` : 'Nenhum arquivo foi vinculado a esta APO.'}
            </p>
          </div>
          <AttachmentDialog apo={apo} />
        </div>

        {apo.votos && apo.votos.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-display font-semibold text-foreground">Votos registrados:</p>
            {apo.votos.map((voto) => (
              <div key={`${apo.id}-${voto.membro}`} className="flex items-center gap-2 font-body text-xs">
                <Badge variant={voto.decisao === 'aprovar' ? 'default' : 'destructive'} className={voto.decisao === 'aprovar' ? 'bg-success text-success-foreground' : ''}>
                  {voto.decisao}
                </Badge>
                <span className="text-muted-foreground">{voto.membro}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-display font-semibold text-foreground">Justificativa obrigatoria</p>
            {!justificativaPreenchida && <span className="text-[11px] font-body text-destructive">Preencha para liberar o voto</span>}
          </div>
          <Textarea
            placeholder="Justificativa do voto..."
            value={justificativa}
            onChange={(event) => setJustificativa(event.target.value)}
            rows={2}
            required
            aria-required="true"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => votar('devolver')} disabled={voteMutation.isPending || !justificativaPreenchida}>
            <RotateCcw className="mr-1 h-3 w-3" /> Devolver
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => votar('reprovar')} disabled={voteMutation.isPending || !justificativaPreenchida}>
            <ThumbsDown className="mr-1 h-3 w-3" /> Reprovar
          </Button>
          <Button size="sm" className="bg-gradient-accent font-display text-accent-foreground" onClick={() => votar('aprovar')} disabled={voteMutation.isPending || !justificativaPreenchida}>
            <ThumbsUp className="mr-1 h-3 w-3" /> Aprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AttachmentDialog({ apo }: { apo: APORecord }) {
  const hasAttachments = apo.anexos.length > 0;

  const handleDownloadSingle = (attachmentName: string) => {
    downloadAttachmentRecord(apo, attachmentName);
    toast.success(`Download preparado para "${attachmentName}".`);
  };

  const handleDownloadAll = () => {
    apo.anexos.forEach((attachmentName, index) => {
      window.setTimeout(() => downloadAttachmentRecord(apo, attachmentName), index * 150);
    });

    toast.success(`Preparando ${apo.anexos.length} download(s) da APO "${apo.titulo}".`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-1 h-3 w-3" /> Ver arquivos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Arquivos da APO</DialogTitle>
          <p className="pr-8 font-body text-sm text-muted-foreground">{apo.titulo}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
            <div>
              <p className="text-sm font-display font-semibold text-foreground">{apo.anexos.length} arquivo(s) encontrado(s)</p>
              <p className="font-body text-xs text-muted-foreground">Visualize os anexos cadastrados e baixe individualmente ou de uma vez.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={!hasAttachments}>
              <Download className="mr-1 h-3 w-3" /> Baixar tudo
            </Button>
          </div>

          {hasAttachments ? (
            <div className="space-y-2">
              {apo.anexos.map((attachmentName) => (
                <div key={`${apo.id}-${attachmentName}`} className="flex flex-col gap-3 rounded-xl border border-border/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">{attachmentName}</p>
                      <p className="font-body text-xs text-muted-foreground">Arquivo vinculado a {apo.aluno}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadSingle(attachmentName)}>
                    <Download className="mr-1 h-3 w-3" /> Baixar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed px-4 py-8 text-center font-body text-sm text-muted-foreground">
              Esta APO nao possui anexos vinculados.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function downloadAttachmentRecord(apo: APORecord, attachmentName: string) {
  const blob = new Blob(
    [
      `APO: ${apo.titulo}\n`,
      `Aluno: ${apo.aluno}\n`,
      `Tipo: ${apo.tipo}\n`,
      `Status: ${apo.status}\n`,
      `Atualizacao: ${apo.dataAtualizacao}\n`,
      `Arquivo vinculado: ${attachmentName}\n`,
    ],
    { type: 'text/plain;charset=utf-8' },
  );

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${sanitizeFileName(apo.id)}-${sanitizeFileName(attachmentName)}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function sanitizeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

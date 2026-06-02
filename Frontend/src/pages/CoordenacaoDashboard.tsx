import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileCheck, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { decideApo, getApos, queryKeys } from '@/lib/api';
import { APORecord } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function CoordenacaoDashboard() {
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos });
  const itens = apos.filter((entry) => entry.status === 'em_avaliacao_coordenacao');
  const empates = itens.filter((entry) => entry.coordenacaoEntrada === 'empate');
  const aprovacaoPadrao = itens.filter((entry) => entry.coordenacaoEntrada !== 'empate');
  const aprovados = apos.filter((entry) => entry.status === 'aprovado').length;
  const empatesResolvidos = apos.filter((entry) =>
    entry.coordenacaoEntrada === 'empate' && entry.status !== 'em_avaliacao_coordenacao'
  ).length;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Painel da Coordenação</h1>
        <p className="font-body text-sm text-muted-foreground">Decisão final e geração de assinatura</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-warning"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="font-body text-xs text-muted-foreground">Aguardando Decisão</p><p className="text-xl font-display font-bold">{itens.length}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-success"><FileCheck className="h-5 w-5" /></div>
            <div><p className="font-body text-xs text-muted-foreground">Aprovados (total)</p><p className="text-xl font-display font-bold">{aprovados}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-info"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="font-body text-xs text-muted-foreground">Empates Resolvidos</p><p className="text-xl font-display font-bold">{empatesResolvidos}</p></div>
          </CardContent>
        </Card>
      </div>

      <CoordenacaoSection title="Empates" emptyMessage="Nenhum empate aguardando decisão.">
        {empates.map((apo, index) => (
          <motion.div key={apo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <DecisaoCard apo={apo} />
          </motion.div>
        ))}
      </CoordenacaoSection>

      <CoordenacaoSection title="Aprovação padrão" emptyMessage="Nenhuma APO em aprovação padrão.">
        {aprovacaoPadrao.map((apo, index) => (
          <motion.div key={apo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <DecisaoCard apo={apo} />
          </motion.div>
        ))}
      </CoordenacaoSection>

    </div>
  );
}

function CoordenacaoSection({ title, emptyMessage, children }: { title: string; emptyMessage: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const hasItems = Array.isArray(items) ? items.length > 0 : Boolean(items);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold">{title}</h2>
      {hasItems ? items : (
        <Card className="shadow-card">
          <CardContent className="p-6 text-center font-body text-sm text-muted-foreground">{emptyMessage}</CardContent>
        </Card>
      )}
    </div>
  );
}

function DecisaoCard({ apo }: { apo: APORecord }) {
  const [justificativa, setJustificativa] = useState('');
  const queryClient = useQueryClient();
  const decisionMutation = useMutation({
    mutationFn: (action: 'aprovar' | 'reprovar' | 'devolver') => decideApo(apo.id, action, justificativa || 'Atualizacao registrada pela coordenacao.'),
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      const messages: Record<'aprovar' | 'reprovar' | 'devolver', string> = {
        aprovar: 'APO aprovada! Assinatura eletronica solicitada.',
        reprovar: 'APO reprovada.',
        devolver: 'APO devolvida a comissao.',
      };
      toast.success(messages[action]);
      setJustificativa('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel registrar a decisao.');
    },
  });

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

        {apo.votos && (
          <div className="space-y-1 rounded-lg bg-secondary p-3">
            <p className="text-xs font-display font-semibold">Votos da Comissão:</p>
            {apo.votos.map((voto) => (
              <div key={`${apo.id}-${voto.membro}`} className="flex items-center gap-2 font-body text-xs">
                <Badge variant={voto.decisao === 'aprovar' ? 'default' : 'destructive'} className={voto.decisao === 'aprovar' ? 'bg-success text-success-foreground' : ''}>
                  {voto.decisao}
                </Badge>
                <span>{voto.membro}: {voto.justificativa}</span>
              </div>
            ))}
          </div>
        )}

        <Textarea placeholder="Parecer da coordenação..." value={justificativa} onChange={(event) => setJustificativa(event.target.value)} rows={2} />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => decisionMutation.mutate('devolver')} disabled={decisionMutation.isPending}>Devolver</Button>
          <Button variant="outline" size="sm" onClick={() => decisionMutation.mutate('reprovar')} disabled={decisionMutation.isPending}>Reprovar</Button>
          <Button size="sm" className="bg-gradient-accent font-display text-accent-foreground" onClick={() => decisionMutation.mutate('aprovar')} disabled={decisionMutation.isPending}>
            Aprovar e Gerar Assinatura
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

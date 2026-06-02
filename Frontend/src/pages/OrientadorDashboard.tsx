import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, Clock, Users } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { approveByOrientador, getApos, getStudents, queryKeys, returnByOrientador } from '@/lib/api';
import { APORecord } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function OrientadorDashboard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos });
  const { data: students = [] } = useQuery({ queryKey: queryKeys.students, queryFn: getStudents });
  const aposDoOrientador = apos.filter((entry) => entry.orientadorId === user?.id);
  const orientados = students.filter((entry) => entry.orientadorId === user?.id);
  const pendentes = aposDoOrientador.filter((entry) => entry.status === 'em_avaliacao_orientador');
  const historico = aposDoOrientador.filter((entry) => entry.status !== 'em_avaliacao_orientador' && entry.status !== 'rascunho');

  const stats = [
    { label: 'Pendentes', value: pendentes.length, icon: Clock, color: 'text-warning' },
    { label: 'Total Avaliadas', value: historico.length, icon: ClipboardList, color: 'text-primary' },
    { label: 'Orientados Ativos', value: orientados.length, icon: Users, color: 'text-accent' },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{compact ? 'Pendências do Orientador' : 'Painel do Orientador'}</h1>
        <p className="font-body text-sm text-muted-foreground">
          {compact ? 'Submissões aguardando avaliação dos seus orientados' : 'Avalie as submissões dos seus orientados'}
        </p>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-display font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Submissões Pendentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendentes.length === 0 ? (
            <div className="p-8 text-center font-body text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
              Nenhuma pendência no momento
            </div>
          ) : (
            <div className="divide-y">
              {pendentes.map((apo) => (
                <AvaliacaoItem key={apo.id} apo={apo} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AvaliacaoItem({ apo }: { apo: APORecord }) {
  const [justificativa, setJustificativa] = useState('');
  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: () => approveByOrientador(apo.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      toast.success(`APO "${apo.titulo}" aprovada e encaminhada para a comissao.`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel aprovar a APO.');
    },
  });
  const returnMutation = useMutation({
    mutationFn: () => returnByOrientador(apo.id, justificativa),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      toast.info('APO devolvida ao aluno com justificativa.');
      setJustificativa('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel devolver a APO.');
    },
  });

  const aprovar = () => {
    approveMutation.mutate();
  };

  const devolver = () => {
    if (!justificativa.trim()) {
      toast.error('Informe a justificativa.');
      return;
    }

    returnMutation.mutate();
  };

  return (
    <div className="px-6 py-4 transition-colors hover:bg-secondary/30">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-display font-semibold">{apo.titulo}</p>
          <p className="mt-0.5 font-body text-xs text-muted-foreground">
            {apo.aluno} • {apo.tipo} • {apo.pontos} pt • {apo.anexos.length} anexo(s)
          </p>
          <p className="mt-1 font-body text-xs text-muted-foreground">{apo.descricao}</p>
        </div>
        <div className="flex items-center gap-2 lg:shrink-0">
          <StatusBadge status={apo.status} />
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary font-display text-xs text-primary-foreground">
                Avaliar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Avaliar: {apo.titulo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="font-body text-sm"><strong>Aluno:</strong> {apo.aluno}</p>
                  <p className="font-body text-sm"><strong>Tipo:</strong> {apo.tipo}</p>
                  <p className="font-body text-sm"><strong>Pontos:</strong> {apo.pontos}</p>
                  <p className="mt-2 font-body text-sm">{apo.descricao}</p>
                </div>
                <Textarea
                  placeholder="Justificativa (obrigatória para devolução)..."
                  value={justificativa}
                  onChange={(event) => setJustificativa(event.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="text-destructive" onClick={devolver} disabled={returnMutation.isPending || approveMutation.isPending}>
                    Devolver
                  </Button>
                  <Button className="bg-gradient-accent font-display text-accent-foreground" onClick={aprovar} disabled={approveMutation.isPending || returnMutation.isPending}>
                    Aprovar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

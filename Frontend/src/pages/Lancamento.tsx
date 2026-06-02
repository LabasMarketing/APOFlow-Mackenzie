import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, getStudents, launchApo, queryKeys } from '@/lib/api';
import { toast } from 'sonner';

export default function Lancamento() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });
  const { data: students = [] } = useQuery({ queryKey: queryKeys.students, queryFn: getStudents, enabled: !!user });
  const arquivadas = apos.filter((entry) => entry.status === 'arquivado');

  const launchMutation = useMutation({
    mutationFn: launchApo,
    onSuccess: async (_, apoId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.apos }),
        queryClient.invalidateQueries({ queryKey: queryKeys.students }),
      ]);
      const launched = apos.find((entry) => entry.id === apoId);
      toast.success(`Lançamento de ${launched?.titulo ?? 'APO'} no sistema acadêmico!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel lancar a APO.');
    },
  });

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Fila de Lançamento</h1>
          <p className="font-body text-sm text-muted-foreground">APOs arquivadas aguardando lançamento no sistema acadêmico</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">APOs Arquivadas para Lançar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {arquivadas.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Nenhuma APO aguardando lançamento.</p>
            ) : (
              arquivadas.map((apo) => {
                const aluno = students.find((entry) => entry.id === apo.alunoId);

                return (
                  <div key={apo.id} className="flex flex-col gap-3 rounded-lg border border-border/70 px-4 py-3 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-display font-medium">{apo.titulo}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {apo.aluno} • {apo.pontos} pt
                        {aluno ? ` • ${aluno.pontosAcumulados}/12 pontos acumulados` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 md:justify-end">
                      <StatusBadge status={apo.status} />
                      <Button
                        size="sm"
                        className="bg-gradient-accent font-display text-xs text-accent-foreground"
                        onClick={() => launchMutation.mutate(apo.id)}
                        disabled={launchMutation.isPending}
                      >
                        Lançar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, getStudents, queryKeys } from '@/lib/api';

export default function SecretariaAposLancadas() {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });
  const { data: students = [] } = useQuery({ queryKey: queryKeys.students, queryFn: getStudents, enabled: !!user });
  const lancadas = apos.filter((entry) => entry.status === 'lancado');

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">APOs Lançadas</h1>
          <p className="font-body text-sm text-muted-foreground">APOs já lançadas no sistema acadêmico</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Histórico de Lançamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lancadas.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Nenhuma APO lançada.</p>
            ) : (
              lancadas.map((apo) => {
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
                      <div className="w-20 text-right text-sm font-display font-semibold text-success">Lançado</div>
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

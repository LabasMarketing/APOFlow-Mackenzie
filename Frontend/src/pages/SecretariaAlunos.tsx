import { useQuery } from '@tanstack/react-query';
import { FileText, Users } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, getStudents, queryKeys } from '@/lib/api';
import type { APORecord, AlunoResumo } from '@/lib/mock-data';

const secretariaStatuses = ['aprovado', 'arquivado', 'lancado'];

export default function SecretariaAlunos() {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });
  const { data: students = [] } = useQuery({ queryKey: queryKeys.students, queryFn: getStudents, enabled: !!user });
  const aposDaSecretaria = apos.filter((entry) => secretariaStatuses.includes(entry.status));
  const alunos = students.filter((student) => aposDaSecretaria.some((apo) => apo.alunoId === student.id));

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Alunos</h1>
          <p className="font-body text-sm text-muted-foreground">Alunos com APOs aprovadas, arquivadas ou lançadas</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Lista de Alunos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alunos.length === 0 ? (
              <div className="p-8 text-center font-body text-muted-foreground">
                <Users className="mx-auto mb-2 h-8 w-8 text-accent" />
                Nenhum aluno com APO na secretaria.
              </div>
            ) : (
              alunos.map((aluno) => (
                <AlunoSecretariaCard key={aluno.id} aluno={aluno} apos={aposDaSecretaria.filter((apo) => apo.alunoId === aluno.id)} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function AlunoSecretariaCard({ aluno, apos }: { aluno: AlunoResumo; apos: APORecord[] }) {
  return (
    <div className="rounded-lg border border-border/70 p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-display font-semibold">{aluno.nome}</p>
          <p className="font-body text-xs text-muted-foreground">{aluno.pontosAcumulados}/12 pontos acumulados</p>
        </div>
        <Badge variant="outline">{apos.length} APO(s)</Badge>
      </div>

      <div className="mt-4 space-y-2">
        {apos.map((apo) => (
          <div key={apo.id} className="flex flex-col gap-2 rounded-md bg-secondary/40 px-3 py-2 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-display font-medium">{apo.titulo}</span>
            </div>
            <StatusBadge status={apo.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

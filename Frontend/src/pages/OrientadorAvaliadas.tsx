import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, FileText, Paperclip } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, queryKeys } from '@/lib/api';
import type { APORecord } from '@/lib/mock-data';

export default function OrientadorAvaliadas() {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });

  if (!user) {
    return <LoginPage />;
  }

  const orientadorApos = getAposDoOrientador(apos, user.id);
  const avaliadas = orientadorApos.filter((entry) => entry.status !== 'em_avaliacao_orientador' && entry.status !== 'rascunho');

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">APOs Avaliadas</h1>
          <p className="font-body text-sm text-muted-foreground">Submissões que já passaram pela avaliação do orientador</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Histórico de Avaliações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {avaliadas.length === 0 ? (
              <div className="p-8 text-center font-body text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                Nenhuma APO avaliada ainda.
              </div>
            ) : (
              <div className="divide-y">
                {avaliadas.map((apo) => (
                  <ApoAvaliadaItem key={apo.id} apo={apo} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function ApoAvaliadaItem({ apo }: { apo: APORecord }) {
  return (
    <div className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-secondary/30 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-display font-semibold">{apo.titulo}</p>
            <p className="mt-0.5 font-body text-xs text-muted-foreground">
              {apo.aluno} • {apo.tipo} • {apo.pontos} pt • {apo.anexos.length} anexo(s)
            </p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 font-body text-xs text-muted-foreground">{apo.descricao}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {apo.anexos.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" /> {apo.anexos.length}
          </span>
        )}
        <Badge className="bg-success text-success-foreground">Avaliado</Badge>
        <StatusBadge status={apo.status} />
      </div>
    </div>
  );
}

function getAposDoOrientador(apos: APORecord[], orientadorId: string) {
  return apos.filter((entry) => entry.orientadorId === orientadorId);
}

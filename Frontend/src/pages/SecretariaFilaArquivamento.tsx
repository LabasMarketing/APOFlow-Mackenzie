import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { archiveApo, getApos, queryKeys } from '@/lib/api';
import { toast } from 'sonner';

export default function SecretariaFilaArquivamento() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });
  const aprovados = apos.filter((entry) => entry.status === 'aprovado');

  const archiveMutation = useMutation({
    mutationFn: archiveApo,
    onSuccess: async (_, apoId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.apos });
      const archived = apos.find((entry) => entry.id === apoId);
      toast.success(`"${archived?.titulo ?? 'APO'}" arquivada.`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel arquivar a APO.');
    },
  });

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Fila de Arquivamento</h1>
          <p className="font-body text-sm text-muted-foreground">APOs aprovadas pela coordenação aguardando arquivamento</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg font-display">Fila de Arquivamento</CardTitle>
              <Button variant="outline" size="sm" onClick={() => toast.success('Pacote exportado (simulado).')}>
                <Download className="mr-1 h-3 w-3" /> Exportar Pacote
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {aprovados.map((apo) => (
                <div key={apo.id} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-secondary/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-display font-medium">{apo.titulo}</p>
                    <p className="font-body text-xs text-muted-foreground">{apo.aluno} • {apo.pontos} pt</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apo.status} />
                    <Button size="sm" variant="outline" onClick={() => archiveMutation.mutate(apo.id)} disabled={archiveMutation.isPending}>
                      Arquivar
                    </Button>
                  </div>
                </div>
              ))}
              {aprovados.length === 0 && <div className="p-8 text-center font-body text-muted-foreground">Nenhum item na fila.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

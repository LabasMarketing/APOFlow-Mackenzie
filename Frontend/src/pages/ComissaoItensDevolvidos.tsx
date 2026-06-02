import { useQuery } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { ComissaoReadonlyCard } from '@/components/ComissaoReadonlyCard';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, queryKeys } from '@/lib/api';

export default function ComissaoItensDevolvidos() {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });

  if (!user) {
    return <LoginPage />;
  }

  const devolvidos = apos.filter((apo) =>
    apo.votos?.some((voto) => voto.membro === user.nome && voto.decisao === 'devolver')
  );

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Itens Devolvidos</h1>
          <p className="font-body text-sm text-muted-foreground">APOs em que seu voto foi de devolução</p>
        </div>

        <div className="space-y-4">
          {devolvidos.map((apo) => (
            <ComissaoReadonlyCard key={apo.id} apo={apo} statusLabel="Devolvido" tone="returned" />
          ))}
          {devolvidos.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center font-body text-muted-foreground">
                <RotateCcw className="mx-auto mb-2 h-8 w-8 text-red-600" />
                Nenhum item devolvido por você.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

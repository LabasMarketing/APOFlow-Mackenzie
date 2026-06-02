import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/components/LoginPage';
import { CoordenacaoReadonlyCard } from '@/components/CoordenacaoReadonlyCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApos, queryKeys } from '@/lib/api';

export default function CoordenacaoEmpatesResolvidos() {
  const { user } = useAuth();
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos, enabled: !!user });

  if (!user) {
    return <LoginPage />;
  }

  const empatesResolvidos = apos.filter((apo) =>
    apo.coordenacaoEntrada === 'empate' && apo.status !== 'em_avaliacao_coordenacao'
  );

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Empates Resolvidos</h1>
          <p className="font-body text-sm text-muted-foreground">APOs que chegaram por empate e já receberam decisão da coordenação</p>
        </div>

        <div className="space-y-4">
          {empatesResolvidos.map((apo) => (
            <CoordenacaoReadonlyCard key={apo.id} apo={apo} badgeLabel="Empate Resolvido" />
          ))}
          {empatesResolvidos.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center font-body text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                Nenhum empate resolvido pela coordenação.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { APORecord } from '@/lib/mock-data';

interface CoordenacaoReadonlyCardProps {
  apo: APORecord;
  badgeLabel: string;
}

export function CoordenacaoReadonlyCard({ apo, badgeLabel }: CoordenacaoReadonlyCardProps) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-base font-display">{apo.titulo}</CardTitle>
            <p className="mt-1 font-body text-xs text-muted-foreground">{apo.aluno} • {apo.tipo} • {apo.pontos} pt</p>
          </div>
          <Badge variant="outline" className="border-green-200 bg-green-100 text-green-700">
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-body text-sm text-muted-foreground">{apo.descricao}</p>

        {apo.votos && apo.votos.length > 0 && (
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
      </CardContent>
    </Card>
  );
}

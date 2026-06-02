import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Archive, Download, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getApos, getStudents, queryKeys } from '@/lib/api';

export default function SecretariaDashboard() {
  const { data: apos = [] } = useQuery({ queryKey: queryKeys.apos, queryFn: getApos });
  const { data: students = [] } = useQuery({ queryKey: queryKeys.students, queryFn: getStudents });

  const aprovados = apos.filter((entry) => entry.status === 'aprovado');
  const arquivados = apos.filter((entry) => entry.status === 'arquivado');
  const lancados = apos.filter((entry) => entry.status === 'lancado');

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Painel da Secretaria</h1>
        <p className="font-body text-sm text-muted-foreground">Arquivamento e lançamento no sistema acadêmico</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Aguardando Arquivamento', value: aprovados.length, icon: Archive, color: 'text-warning' },
          { label: 'Aguardando Lançamento', value: arquivados.length, icon: Download, color: 'text-success' },
          { label: 'APOs Lançadas', value: lancados.length, icon: TrendingUp, color: 'text-accent' },
          { label: 'Alunos Ativos', value: students.length, icon: Users, color: 'text-primary' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div><p className="font-body text-xs text-muted-foreground">{stat.label}</p><p className="text-xl font-display font-bold">{stat.value}</p></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { getNotifications, queryKeys } from '@/lib/api';

export default function Notificacoes() {
  const { user } = useAuth();
  const recipient = user?.id ?? '';
  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications(recipient),
    queryFn: () => getNotifications(recipient),
    enabled: !!user,
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Notificações</h1>
        <p className="font-body text-sm text-muted-foreground">Acompanhe as atualizações do sistema</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notificacao, index) => (
              <motion.div
                key={notificacao.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-3 px-6 py-4 ${!notificacao.lida ? 'bg-info/5' : ''}`}
              >
                <div className={`mt-0.5 ${notificacao.lida ? 'text-muted-foreground' : 'text-info'}`}>
                  {notificacao.lida ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </div>
                <div>
                  <p className={`font-body text-sm ${!notificacao.lida ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {notificacao.titulo}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">{notificacao.tempo}</p>
                </div>
              </motion.div>
            ))}
            {notifications.length === 0 && <div className="px-6 py-8 text-center font-body text-sm text-muted-foreground">Nenhuma notificacao encontrada.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

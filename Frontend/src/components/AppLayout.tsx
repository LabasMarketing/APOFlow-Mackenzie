import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import { MackenzieLogo } from '@/components/MackenzieLogo';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationsAsRead, queryKeys } from '@/lib/api';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const recipient = user?.id ?? '';
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications(recipient),
    queryFn: () => getNotifications(recipient),
    enabled: !!user && user.papel !== 'admin',
  });

  const newNotifications = notifications.filter((notification) => !notification.lida);
  const markAsReadMutation = useMutation({
    mutationFn: () => markNotificationsAsRead(recipient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(recipient) });
    },
  });

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger />
            <h2 className="text-sm font-display font-semibold text-foreground">Sistema APOFlow</h2>
            <div className="ml-auto flex items-center gap-3">
              {user.papel !== 'admin' && (
                <div className="relative" ref={containerRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((state) => !state)}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-secondary/10"
                    aria-label="Notificações"
                  >
                    <Bell className="h-5 w-5" />
                    {newNotifications.length > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
                        {newNotifications.length}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-80 min-w-[18rem] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                      <div className="border-b border-border px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">Notificações recentes</p>
                            <p className="mt-1 text-xs text-muted-foreground">Apenas notificações novas do usuário</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => markAsReadMutation.mutate()}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-destructive bg-red-500 text-white transition hover:bg-red-600"
                            title="Marcar todas como lidas"
                            aria-label="Marcar todas como lidas"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto p-2">
                        {newNotifications.length > 0 ? (
                          newNotifications.slice(0, 4).map((notification) => (
                            <div key={notification.id} className="rounded-2xl border border-border/50 bg-background px-3 py-3 text-sm transition hover:bg-secondary/10">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 text-info">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-medium">{notification.titulo}</span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">{notification.tempo}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl bg-background px-3 py-6 text-center text-sm text-muted-foreground">
                            Sem novas notificações.
                          </div>
                        )}
                      </div>
                      {newNotifications.length > 4 && (
                        <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
                          Veja mais no menu de notificações.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <MackenzieLogo />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

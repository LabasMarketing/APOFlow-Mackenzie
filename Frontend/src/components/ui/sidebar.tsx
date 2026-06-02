import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarState = 'expanded' | 'collapsed';

interface SidebarContextValue {
  state: SidebarState;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SidebarState>('expanded');
  const value = useMemo(
    () => ({
      state,
      toggle: () => setState((current) => (current === 'expanded' ? 'collapsed' : 'expanded')),
    }),
    [state],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }

  return context;
}

export function SidebarTrigger() {
  const { toggle } = useSidebar();

  return (
    <button
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-secondary"
      onClick={toggle}
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
}

export function Sidebar({ children, className }: { children: ReactNode; collapsible?: 'icon'; className?: string }) {
  const { state } = useSidebar();

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        state === 'collapsed' ? 'w-20' : 'w-72',
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1 overflow-y-auto px-3 py-4', className)}>{children}</div>;
}

export function SidebarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('space-y-3', className)}>{children}</section>;
}

export function SidebarGroupLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-3 text-xs uppercase tracking-[0.18em] text-sidebar-foreground/60', className)}>{children}</div>;
}

export function SidebarGroupContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export function SidebarMenu({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export function SidebarMenuItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

export function SidebarMenuButton({ children, asChild, className }: { children: ReactNode; asChild?: boolean; className?: string }) {
  if (asChild && isValidElement(children)) {
    const element = children as ReactElement<{ className?: string }>;
    return cloneElement(element, {
      className: cn(
        'flex w-full items-center rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground',
        element.props.className,
        className,
      ),
    });
  }

  return <button className={cn('w-full rounded-lg px-3 py-2 text-left', className)}>{children}</button>;
}

export function SidebarFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border-t border-sidebar-border p-3', className)}>{children}</div>;
}

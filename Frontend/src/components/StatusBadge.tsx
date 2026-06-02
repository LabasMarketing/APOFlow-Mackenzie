import { Badge } from '@/components/ui/badge';
import { APOStatus, getStatusLabel, getStatusVariant } from '@/lib/mock-data';

export function StatusBadge({ status }: { status: APOStatus }) {
  const variant = getStatusVariant(status);
  const label = getStatusLabel(status);

  const colorClasses: Record<string, string> = {
    default: 'bg-success text-success-foreground',
    destructive: '',
    secondary: 'bg-info/15 text-info border-info/20',
    outline: '',
  };

  return (
    <Badge variant={variant} className={colorClasses[variant]}>
      {label}
    </Badge>
  );
}

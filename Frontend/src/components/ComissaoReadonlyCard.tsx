import { Download, Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { APORecord } from '@/lib/mock-data';
import { toast } from 'sonner';

interface ComissaoReadonlyCardProps {
  apo: APORecord;
  statusLabel: string;
  tone: 'approved' | 'returned';
}

export function ComissaoReadonlyCard({ apo, statusLabel, tone }: ComissaoReadonlyCardProps) {
  const toneClasses = tone === 'approved'
    ? {
        badge: 'border-green-200 bg-green-100 text-green-700',
      }
    : {
        badge: 'border-red-200 bg-red-100 text-red-700',
      };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-base font-display">{apo.titulo}</CardTitle>
            <p className="mt-1 font-body text-xs text-muted-foreground">{apo.aluno} • {apo.tipo} • {apo.pontos} pt</p>
          </div>
          <Badge variant="outline" className={toneClasses.badge}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-body text-sm text-muted-foreground">{apo.descricao}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-2">
          <div>
            <p className="text-xs font-display font-semibold text-foreground">Arquivos vinculados</p>
            <p className="font-body text-xs text-muted-foreground">
              {apo.anexos.length > 0 ? `${apo.anexos.length} arquivo(s) atrelado(s) a esta APO.` : 'Nenhum arquivo foi vinculado a esta APO.'}
            </p>
          </div>
          <AttachmentDialog apo={apo} />
        </div>

        {apo.votos && apo.votos.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-display font-semibold text-foreground">Votos registrados:</p>
            {apo.votos.map((voto) => (
              <div key={`${apo.id}-${voto.membro}`} className="flex items-center gap-2 font-body text-xs">
                <Badge variant={voto.decisao === 'aprovar' ? 'default' : 'destructive'}>
                  {voto.decisao}
                </Badge>
                <span className="text-muted-foreground">{voto.membro}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttachmentDialog({ apo }: { apo: APORecord }) {
  const hasAttachments = apo.anexos.length > 0;

  const handleDownloadSingle = (attachmentName: string) => {
    downloadAttachmentRecord(apo, attachmentName);
    toast.success(`Download preparado para "${attachmentName}".`);
  };

  const handleDownloadAll = () => {
    apo.anexos.forEach((attachmentName, index) => {
      window.setTimeout(() => downloadAttachmentRecord(apo, attachmentName), index * 150);
    });

    toast.success(`Preparando ${apo.anexos.length} download(s) da APO "${apo.titulo}".`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-1 h-3 w-3" /> Ver arquivos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Arquivos da APO</DialogTitle>
          <p className="pr-8 font-body text-sm text-muted-foreground">{apo.titulo}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
            <div>
              <p className="text-sm font-display font-semibold text-foreground">{apo.anexos.length} arquivo(s) encontrado(s)</p>
              <p className="font-body text-xs text-muted-foreground">Visualize os anexos cadastrados e baixe individualmente ou de uma vez.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={!hasAttachments}>
              <Download className="mr-1 h-3 w-3" /> Baixar tudo
            </Button>
          </div>

          {hasAttachments ? (
            <div className="space-y-2">
              {apo.anexos.map((attachmentName) => (
                <div key={`${apo.id}-${attachmentName}`} className="flex flex-col gap-3 rounded-xl border border-border/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">{attachmentName}</p>
                      <p className="font-body text-xs text-muted-foreground">Arquivo vinculado a {apo.aluno}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadSingle(attachmentName)}>
                    <Download className="mr-1 h-3 w-3" /> Baixar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed px-4 py-8 text-center font-body text-sm text-muted-foreground">
              Esta APO nao possui anexos vinculados.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function downloadAttachmentRecord(apo: APORecord, attachmentName: string) {
  const blob = new Blob(
    [
      `APO: ${apo.titulo}\n`,
      `Aluno: ${apo.aluno}\n`,
      `Tipo: ${apo.tipo}\n`,
      `Status: ${apo.status}\n`,
      `Atualizacao: ${apo.dataAtualizacao}\n`,
      `Arquivo vinculado: ${attachmentName}\n`,
    ],
    { type: 'text/plain;charset=utf-8' },
  );

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${sanitizeFileName(apo.id)}-${sanitizeFileName(attachmentName)}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function sanitizeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

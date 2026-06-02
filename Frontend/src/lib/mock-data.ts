export type Role = 'admin' | 'aluno' | 'orientador' | 'comissao' | 'coordenacao' | 'secretaria';

export type BadgeTone = 'default' | 'destructive' | 'secondary' | 'outline';

export type APOStatus =
  | 'rascunho'
  | 'devolvida'
  | 'em_avaliacao_orientador'
  | 'em_avaliacao_comissao'
  | 'em_avaliacao_coordenacao'
  | 'aprovado'
  | 'reprovado'
  | 'desistida'
  | 'arquivado'
  | 'lancado';

export interface Usuario {
  id: string;
  nome: string;
  papel: Role;
  papeis: Role[];
  email: string;
}

export interface AlunoResumo {
  id: string;
  nome: string;
  orientadorId: string;
  pontosAcumulados: number;
}

export interface APOVote {
  membro: string;
  decisao: 'aprovar' | 'reprovar' | 'devolver';
  justificativa: string;
}

export interface APORecord {
  id: string;
  titulo: string;
  tipo: string;
  descricao: string;
  pontos: number;
  alunoId: string;
  aluno: string;
  orientadorId: string;
  status: APOStatus;
  coordenacaoEntrada?: 'padrao' | 'empate' | null;
  anexos: string[];
  dataAtualizacao: string;
  votos?: APOVote[];
}

export const tiposAPO = [
  'Artigo em periódico',
  'Artigo em congresso',
  'Capítulo de livro',
  'Estágio docência',
  'Minicurso ministrado',
  'Participação em comissão',
  'Patente ou software',
];

const pontosPorTipoNormalizado: Record<string, number> = {
  'artigo em periodico': 4,
  'artigo em congresso': 2,
  'capitulo de livro': 5,
  'estagio docencia': 3,
  'minicurso ministrado': 2,
  'participacao em comissao': 1,
  'patente ou software': 6,
};

function normalizeTipoAtividade(tipo: string) {
  return tipo
    .normalize('NFD')
    .replace(/[^\w\s]|_/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getPontosByTipo(tipo: string) {
  return pontosPorTipoNormalizado[normalizeTipoAtividade(tipo)] ?? null;
}

export interface NotificationItem {
  id: string;
  titulo: string;
  tempo: string;
  lida: boolean;
}

export function getStatusLabel(status: APOStatus) {
  const labels: Record<APOStatus, string> = {
    rascunho: 'Rascunho',
    devolvida: 'Devolvida para ajustes',
    em_avaliacao_orientador: 'APO enviada',
    em_avaliacao_comissao: 'Em avaliação da comissão',
    em_avaliacao_coordenacao: 'Em avaliação da coordenação',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    desistida: 'Desistida',
    arquivado: 'Arquivado',
    lancado: 'Lançado',
  };

  return labels[status];
}

export function getStatusVariant(status: APOStatus): BadgeTone {
  if (status === 'reprovado' || status === 'desistida') {
    return 'destructive';
  }

  if (status === 'aprovado') {
    return 'default';
  }

  if (status === 'arquivado' || status === 'lancado' || status === 'rascunho') {
    return 'outline';
  }

  return 'secondary';
}

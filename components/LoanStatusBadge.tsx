import type { LoanStatus } from '@/lib/types';

const LABELS: Record<LoanStatus, string> = {
  ATIVO: 'Ativo',
  ATRASADO: 'Atrasado',
  DEVOLVIDO: 'Devolvido',
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{LABELS[status]}</span>;
}

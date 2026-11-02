'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency } from '@/lib/format';
import api, { getErrorMessage } from '@/lib/http';
import type { DashboardReport } from '@/lib/types';

function AdminCards() {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardReport>('/reports/dashboard')
      .then((response) => setReport(response.data))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  if (error) {
    return <p className="alert alert-error">{error}</p>;
  }
  if (!report) {
    return <p>Carregando...</p>;
  }
  return (
    <div className="cards">
      <div className="card"><span className="card-label">Livros</span><strong className="card-value">{report.totalBooks}</strong></div>
      <div className="card"><span className="card-label">Empréstimos ativos</span><strong className="card-value">{report.activeLoans}</strong></div>
      <div className="card"><span className="card-label">Atrasados</span><strong className="card-value">{report.overdueLoans}</strong></div>
      <div className="card"><span className="card-label">Multas</span><strong className="card-value">{formatCurrency(report.totalFines)}</strong></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <h1>Dashboard</h1>
      {/* Os relatórios são só do administrador (a API responde 403 para atendente). */}
      {user && (user.isAdmin ? <AdminCards /> : <p>Olá, {user.name}. Use o menu acima para atender os leitores.</p>)}
    </>
  );
}

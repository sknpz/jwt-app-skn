'use client';

import { FormEvent, useState } from 'react';
import { Feedback } from '@/components/Feedback';
import { LoanStatusBadge } from '@/components/LoanStatusBadge';
import { formatCpf, formatCurrency, formatDate } from '@/lib/format';
import { formValues, withQuery } from '@/lib/form';
import { useAction, useApiList } from '@/lib/hooks';
import api from '@/lib/http';
import type { Loan, Reader } from '@/lib/types';

function ReaderHistory({ reader, onClose }: { reader: Reader; onClose: () => void }) {
  const { items: loans, loading, error } = useApiList<Loan>(`/readers/${reader.id}/loans`);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Histórico de {reader.name}</h2>
        <button type="button" className="btn" onClick={onClose}>Fechar</button>
      </div>
      <Feedback error={error} />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Livro</th>
              <th>Empréstimo</th>
              <th>Prazo</th>
              <th>Devolução</th>
              <th>Status</th>
              <th>Multa</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.book.title}</td>
                <td>{formatDate(loan.loanDate)}</td>
                <td>{formatDate(loan.dueDate)}</td>
                <td>{formatDate(loan.returnDate)}</td>
                <td><LoanStatusBadge status={loan.status} /></td>
                <td>{formatCurrency(loan.fine)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
        {!loading && loans.length === 0 && <p className="table-note">Este leitor ainda não pegou livros.</p>}
      </div>
    </section>
  );
}

export default function ReadersPage() {
  const [search, setSearch] = useState('');
  const { items: readers, loading, error, reload } = useApiList<Reader>(withQuery('/readers', { search }));
  const [editing, setEditing] = useState<Reader | null>(null);
  const [historyOf, setHistoryOf] = useState<Reader | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const action = useAction();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = formValues(event.currentTarget);
    const saved = await action.run(async () => {
      if (editing) {
        await api.put(`/readers/${editing.id}`, data);
        return 'Leitor atualizado';
      }
      await api.post('/readers', data);
      return 'Leitor cadastrado';
    });
    if (saved) {
      setEditing(null);
      setFormVersion((current) => current + 1);
      reload();
    }
  }

  return (
    <>
      <h1>Leitores</h1>
      <Feedback error={action.error || error} success={action.success} />

      <section className="panel">
        <h2>{editing ? `Editar: ${editing.name}` : 'Novo leitor'}</h2>
        <form key={`${editing?.id ?? 'new'}-${formVersion}`} onSubmit={save} className="form-grid">
          <label className="field">
            Nome
            <input name="name" defaultValue={editing?.name} required />
          </label>
          <label className="field">
            CPF
            <input name="cpf" defaultValue={editing ? formatCpf(editing.cpf) : ''} placeholder="000.000.000-00" required />
          </label>
          <label className="field">
            E-mail
            <input name="email" type="email" defaultValue={editing?.email ?? ''} />
          </label>
          <label className="field">
            Telefone
            <input name="phone" defaultValue={editing?.phone ?? ''} />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={action.pending}>Salvar</button>
            {editing && <button type="button" className="btn" onClick={() => setEditing(null)}>Cancelar</button>}
          </div>
        </form>
      </section>

      {historyOf && <ReaderHistory key={historyOf.id} reader={historyOf} onClose={() => setHistoryOf(null)} />}

      <section className="panel filters" aria-label="Filtros">
        <label className="field">
          Buscar por nome ou CPF
          <input name="search-reader" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </section>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {readers.map((reader) => (
              <tr key={reader.id}>
                <td>{reader.name}</td>
                <td>{formatCpf(reader.cpf)}</td>
                <td>{reader.email || '-'}</td>
                <td>{reader.phone || '-'}</td>
                <td className="actions">
                  <button type="button" className="btn" onClick={() => setHistoryOf(reader)}>Histórico</button>
                  <button type="button" className="btn" onClick={() => setEditing(reader)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
        {!loading && readers.length === 0 && <p className="table-note">Nenhum leitor encontrado.</p>}
      </div>
    </>
  );
}

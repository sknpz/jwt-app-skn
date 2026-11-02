'use client';

import { FormEvent, useState } from 'react';
import { Feedback } from '@/components/Feedback';
import { LoanStatusBadge } from '@/components/LoanStatusBadge';
import { formatCpf, formatCurrency, formatDate } from '@/lib/format';
import { withQuery } from '@/lib/form';
import { useAction, useApiList } from '@/lib/hooks';
import api from '@/lib/http';
import type { Book, Loan, Reader } from '@/lib/types';

export default function LoansPage() {
  const [status, setStatus] = useState('');
  const { items: loans, loading, error, reload } = useApiList<Loan>(withQuery('/loans', { status }));

  const [readerSearch, setReaderSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const { items: readers } = useApiList<Reader>(withQuery('/readers', { search: readerSearch }));
  const { items: books, reload: reloadBooks } = useApiList<Book>(
    withQuery('/books', { title: bookSearch, available: 'true' })
  );

  const [formVersion, setFormVersion] = useState(0);
  const action = useAction();

  async function createLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await action.run(async () => {
      const { data } = await api.post<Loan>('/loans', {
        readerId: Number(form.get('readerId')),
        bookId: Number(form.get('bookId')),
      });
      return `Empréstimo registrado. Devolver até ${formatDate(data.dueDate)}.`;
    });
    // Mesmo na recusa o estoque pode ter mudado: atualiza as listas.
    reload();
    reloadBooks();
    if (created) {
      setFormVersion((current) => current + 1);
      setReaderSearch('');
      setBookSearch('');
    }
  }

  async function returnLoan(loan: Loan) {
    await action.run(async () => {
      const { data } = await api.patch<Loan>(`/loans/${loan.id}/return`);
      const fine = Number(data.fine);
      return fine > 0
        ? `Devolução registrada com atraso. Multa: ${formatCurrency(fine)}.`
        : 'Devolução registrada, sem multa.';
    });
    reload();
    reloadBooks();
  }

  return (
    <>
      <h1>Empréstimos</h1>
      <Feedback error={action.error || error} success={action.success} />

      <section className="panel">
        <h2>Novo empréstimo</h2>
        <form key={formVersion} onSubmit={createLoan} className="form-grid">
          <label className="field">
            Buscar leitor (nome ou CPF)
            <input name="reader-search" value={readerSearch} onChange={(event) => setReaderSearch(event.target.value)} />
          </label>
          <label className="field">
            Leitor
            <select name="readerId" defaultValue="" required>
              <option value="" disabled>Selecione ({readers.length} encontrado{readers.length === 1 ? '' : 's'})</option>
              {readers.map((reader) => (
                <option key={reader.id} value={reader.id}>{reader.name} - {formatCpf(reader.cpf)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Buscar livro disponível (título)
            <input name="book-search" value={bookSearch} onChange={(event) => setBookSearch(event.target.value)} />
          </label>
          <label className="field">
            Livro
            <select name="bookId" defaultValue="" required>
              <option value="" disabled>Selecione ({books.length} encontrado{books.length === 1 ? '' : 's'})</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>{book.title} ({book.availableCopies} disponíve{book.availableCopies === 1 ? 'l' : 'is'})</option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={action.pending}>Registrar empréstimo</button>
          </div>
        </form>
      </section>

      <section className="panel filters" aria-label="Filtros">
        <label className="field">
          Status
          <select name="filter-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="ATRASADO">Atrasado</option>
            <option value="DEVOLVIDO">Devolvido</option>
          </select>
        </label>
      </section>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Livro</th>
              <th>Leitor</th>
              <th>Empréstimo</th>
              <th>Prazo</th>
              <th>Devolução</th>
              <th>Status</th>
              <th>Multa</th>
              <th>Atendente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.book.title}</td>
                <td>{loan.reader.name}</td>
                <td>{formatDate(loan.loanDate)}</td>
                <td>{formatDate(loan.dueDate)}</td>
                <td>{formatDate(loan.returnDate)}</td>
                <td><LoanStatusBadge status={loan.status} /></td>
                <td>{formatCurrency(loan.fine)}</td>
                <td>{loan.user.name}</td>
                <td className="actions">
                  {loan.status !== 'DEVOLVIDO' && (
                    <button type="button" className="btn" onClick={() => returnLoan(loan)} disabled={action.pending}>
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
        {!loading && loans.length === 0 && <p className="table-note">Nenhum empréstimo encontrado.</p>}
      </div>
    </>
  );
}

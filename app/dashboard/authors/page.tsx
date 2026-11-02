'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Feedback } from '@/components/Feedback';
import { formatDate } from '@/lib/format';
import { formValues } from '@/lib/form';
import { useAction, useApiList } from '@/lib/hooks';
import api from '@/lib/http';
import type { Author } from '@/lib/types';

export default function AuthorsPage() {
  const { user } = useAuth();
  const { items: authors, loading, error, reload } = useApiList<Author>('/authors');
  const [editing, setEditing] = useState<Author | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const action = useAction();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = formValues(event.currentTarget);
    const saved = await action.run(async () => {
      if (editing) {
        await api.put(`/authors/${editing.id}`, data);
        return 'Autor atualizado';
      }
      await api.post('/authors', data);
      return 'Autor cadastrado';
    });
    if (saved) {
      setEditing(null);
      setFormVersion((current) => current + 1);
      reload();
    }
  }

  async function remove(author: Author) {
    if (!window.confirm(`Excluir o autor "${author.name}"?`)) {
      return;
    }
    const removed = await action.run(async () => {
      await api.delete(`/authors/${author.id}`);
      return 'Autor excluído';
    });
    if (removed) {
      reload();
    }
  }

  return (
    <>
      <h1>Autores</h1>
      <Feedback error={action.error || error} success={action.success} />

      {user?.isAdmin && (
        <section className="panel">
          <h2>{editing ? `Editar: ${editing.name}` : 'Novo autor'}</h2>
          <form key={`${editing?.id ?? 'new'}-${formVersion}`} onSubmit={save} className="form-grid">
            <label className="field">
              Nome
              <input name="name" defaultValue={editing?.name} required />
            </label>
            <label className="field">
              Nacionalidade
              <input name="nationality" defaultValue={editing?.nationality ?? ''} />
            </label>
            <label className="field">
              Data de nascimento
              <input name="birthDate" type="date" defaultValue={editing?.birthDate ?? ''} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={action.pending}>Salvar</button>
              {editing && <button type="button" className="btn" onClick={() => setEditing(null)}>Cancelar</button>}
            </div>
          </form>
        </section>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nacionalidade</th>
              <th>Nascimento</th>
              {user?.isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                <td>{author.name}</td>
                <td>{author.nationality || '-'}</td>
                <td>{formatDate(author.birthDate)}</td>
                {user?.isAdmin && (
                  <td className="actions">
                    <button type="button" className="btn" onClick={() => setEditing(author)}>Editar</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(author)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
        {!loading && authors.length === 0 && <p className="table-note">Nenhum autor cadastrado.</p>}
      </div>
    </>
  );
}

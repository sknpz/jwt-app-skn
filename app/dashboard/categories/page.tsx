'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Feedback } from '@/components/Feedback';
import { formValues } from '@/lib/form';
import { useAction, useApiList } from '@/lib/hooks';
import api from '@/lib/http';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { items: categories, loading, error, reload } = useApiList<Category>('/categories');
  const [editing, setEditing] = useState<Category | null>(null);
  const [formVersion, setFormVersion] = useState(0); // mudar a key recria o form limpo
  const action = useAction();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = formValues(event.currentTarget);
    const saved = await action.run(async () => {
      if (editing) {
        await api.put(`/categories/${editing.id}`, data);
        return 'Categoria atualizada';
      }
      await api.post('/categories', data);
      return 'Categoria cadastrada';
    });
    if (saved) {
      setEditing(null);
      setFormVersion((current) => current + 1);
      reload();
    }
  }

  async function remove(category: Category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) {
      return;
    }
    const removed = await action.run(async () => {
      await api.delete(`/categories/${category.id}`);
      return 'Categoria excluída';
    });
    if (removed) {
      reload();
    }
  }

  return (
    <>
      <h1>Categorias</h1>
      <Feedback error={action.error || error} success={action.success} />

      {user?.isAdmin && (
        <section className="panel">
          <h2>{editing ? `Editar: ${editing.name}` : 'Nova categoria'}</h2>
          <form key={`${editing?.id ?? 'new'}-${formVersion}`} onSubmit={save} className="form-grid">
            <label className="field">
              Nome
              <input name="name" defaultValue={editing?.name} required />
            </label>
            <label className="field">
              Descrição
              <input name="description" defaultValue={editing?.description ?? ''} />
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
              <th>Descrição</th>
              {user?.isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                {user?.isAdmin && (
                  <td className="actions">
                    <button type="button" className="btn" onClick={() => setEditing(category)}>Editar</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(category)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
        {!loading && categories.length === 0 && <p className="table-note">Nenhuma categoria cadastrada.</p>}
      </div>
    </>
  );
}

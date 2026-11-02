'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Feedback } from '@/components/Feedback';
import { formValues } from '@/lib/form';
import { useAction, useApiList } from '@/lib/hooks';
import api from '@/lib/http';
import type { User } from '@/lib/types';

function UsersAdmin({ currentUserId }: { currentUserId: number }) {
  const { items: users, loading, error, reload } = useApiList<User>('/user');
  const [formVersion, setFormVersion] = useState(0);
  const action = useAction();

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = { ...formValues(form), isAdmin: new FormData(form).has('isAdmin') };
    const created = await action.run(async () => {
      await api.post('/user', data);
      return 'Atendente cadastrado';
    });
    if (created) {
      setFormVersion((current) => current + 1);
      reload();
    }
  }

  async function toggleActive(user: User) {
    const changed = await action.run(async () => {
      await api.patch(`/user/${user.id}/active`, { active: !user.active });
      return user.active ? `${user.name} foi desativado` : `${user.name} foi reativado`;
    });
    if (changed) {
      reload();
    }
  }

  return (
    <>
      <Feedback error={action.error || error} success={action.success} />

      <section className="panel">
        <h2>Novo atendente</h2>
        <form key={formVersion} onSubmit={create} className="form-grid">
          <label className="field">
            Nome
            <input name="name" required />
          </label>
          <label className="field">
            Usuário
            <input name="username" required />
          </label>
          <label className="field">
            E-mail
            <input name="email" type="email" required />
          </label>
          <label className="field">
            Senha
            <input name="password" type="password" minLength={6} autoComplete="new-password" required />
          </label>
          <label className="check">
            <input type="checkbox" name="isAdmin" />
            Administrador
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={action.pending}>Salvar</button>
          </div>
        </form>
      </section>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'Administrador' : 'Atendente'}</td>
                <td>
                  <span className={user.active ? 'badge badge-ativo' : 'badge badge-atrasado'}>
                    {user.active ? 'Ativo' : 'Desativado'}
                  </span>
                </td>
                <td className="actions">
                  {user.id !== currentUserId && (
                    <button
                      type="button"
                      className={user.active ? 'btn btn-danger' : 'btn'}
                      onClick={() => toggleActive(user)}
                      disabled={action.pending}
                    >
                      {user.active ? 'Desativar' : 'Reativar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
      </div>
    </>
  );
}

export default function UsersPage() {
  const { user } = useAuth();

  return (
    <>
      <h1>Atendentes</h1>
      {/* Só para não mostrar uma tela vazia: quem bloqueia de verdade é a API, com 403. */}
      {user && (user.isAdmin
        ? <UsersAdmin currentUserId={user.id} />
        : <p className="alert alert-error">Acesso restrito a administradores.</p>)}
    </>
  );
}

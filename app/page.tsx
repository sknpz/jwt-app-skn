'use client';

import { login } from '@/actions/login';
import { useActionState } from 'react';

export default function LoginPage() {

  const [state, formAction, isPending] = useActionState(login, {
    error: null,
  })

  const {  error } = state

  return (
    <main className="login">
      <h1>Entrar na plataforma</h1>

      <form action={formAction} className="form">
        <label className="field">
          E-mail
          <input name="email" type="email" required autoFocus />
        </label>

        <label className="field">
          Senha
          <input name="password" type="password" required />
        </label>

        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <button disabled={isPending} type="submit" className="btn btn-unipar">
          {isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

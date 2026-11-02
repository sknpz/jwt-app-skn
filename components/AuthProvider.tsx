'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api, { getErrorMessage } from '@/lib/http';
import type { User } from '@/lib/types';

type AuthContextValue = {
  user: User;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function logout() {
  try {
    await api.post('/logout', null, { baseURL: '/api/session' });
  } finally {
    // Recarrega a página inteira para não sobrar nada do usuário na memória.
    window.location.href = '/';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<User>('/auth/me')
      .then((response) => setUser(response.data))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Não foi possível carregar a sessão')));
  }, []);

  if (error) {
    return <p className="alert alert-error page-message">{error}</p>;
  }
  if (!user) {
    return <p className="page-message">Carregando...</p>;
  }
  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return value;
}

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api, { getErrorMessage } from '@/lib/http';
import type { User } from '@/lib/types';

type AuthContextValue = {
  user: User | null; // null enquanto o /auth/me não respondeu
  error: string | null;
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

  // As telas são sempre renderizadas, mesmo antes de o usuário carregar: o Next
  // precisa delas para validar a navegação, e a estrutura da página aparece na hora.
  return <AuthContext.Provider value={{ user, error, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return value;
}

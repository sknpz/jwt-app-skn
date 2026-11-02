'use client';

import { useEffect, useState } from 'react';
import api, { getErrorMessage } from './http';

// Carrega uma lista da API e recarrega sempre que a URL muda (filtros, por exemplo).
export function useApiList<T>(url: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Se a URL mudar antes de esta resposta chegar, ela é ignorada: sem isso, uma
    // busca antiga e mais lenta poderia sobrescrever o resultado da busca nova.
    let ignore = false;
    api.get<T[]>(url)
      .then((response) => {
        if (!ignore) {
          setItems(response.data);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(getErrorMessage(requestError, 'Não foi possível carregar os dados'));
        }
      });
    return () => {
      ignore = true;
    };
  }, [url, version]);

  return {
    items: items ?? [],
    loading: items === null && !error,
    error,
    reload: () => setVersion((current) => current + 1),
  };
}

// Executa uma ação (salvar, excluir...) e guarda a mensagem de sucesso ou de erro.
// A ação devolve o texto de sucesso; run devolve true se deu certo.
export function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<string>) {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      setSuccess(await action());
      return true;
    } catch (actionError) {
      setError(getErrorMessage(actionError));
      return false;
    } finally {
      setPending(false);
    }
  }

  return { error, success, pending, run };
}

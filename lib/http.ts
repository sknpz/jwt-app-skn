import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Cliente usado pelas telas. Ele chama /api/v1/... aqui do próprio Next, e o route
// handler repassa para a API colocando o token que está no cookie httpOnly.
const api = axios.create({ baseURL: '/api/v1' });

type TrackedConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
  _generation?: number;
};

// A fila de espera é esta promise: quem recebe 401 enquanto um refresh está em
// andamento aguarda a mesma promise, em vez de disparar outro refresh.
let refreshInProgress: Promise<void> | null = null;

// Sobe a cada refresh concluído. Uma resposta 401 de requisição enviada antes do
// último refresh só precisa ser repetida: o token novo já está no cookie.
let generation = 0;

// A API revoga tudo se o mesmo refresh token for usado duas vezes. A trava vale
// para todas as abas do navegador: a segunda aba espera a primeira terminar e só
// então envia o cookie, que já é o novo.
function withBrowserLock(task: () => Promise<unknown>): Promise<unknown> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('session-refresh', task);
  }
  return task();
}

function refreshSession() {
  refreshInProgress ??= withBrowserLock(() => axios.post('/api/session/refresh'))
    .then(() => {
      generation += 1;
    })
    .finally(() => {
      refreshInProgress = null;
    });
  return refreshInProgress;
}

api.interceptors.request.use((config: TrackedConfig) => {
  config._generation = generation;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as TrackedConfig | undefined;

    // _retried garante uma única tentativa: se a repetição também der 401, desiste.
    if (error.response?.status !== 401 || !config || config._retried) {
      throw error;
    }
    config._retried = true;

    if (config._generation === generation) {
      try {
        await refreshSession();
      } catch (refreshError) {
        // 401 aqui significa refresh inválido: a sessão acabou. Outra falha (API
        // fora do ar, por exemplo) não desloga, só deixa o erro chegar na tela.
        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
          window.location.href = '/';
        }
        throw error;
      }
    }
    return api(config);
  }
);

// As mensagens de erro da API vêm sempre no campo "error".
export function getErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação') {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || fallback;
  }
  return fallback;
}

export default api;

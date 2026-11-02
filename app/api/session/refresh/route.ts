import axios from 'axios';
import publicApi from '@/lib/api';
import { clearSessionTokens, getSessionTokens, setSessionTokens } from '@/lib/session';

// Troca o refresh token do cookie por um novo par. Os tokens ficam só nos cookies:
// a resposta para o navegador não leva nenhum deles.
export async function POST() {
  const { refreshToken } = await getSessionTokens();
  if (!refreshToken) {
    return Response.json({ error: 'Sessão expirada' }, { status: 401 });
  }

  try {
    const { data } = await publicApi.post('/auth/refresh', { refreshToken });
    await setSessionTokens(data.accessToken, data.refreshToken);
    return Response.json({ message: 'Sessão renovada' });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearSessionTokens();
      return Response.json({ error: 'Sessão expirada' }, { status: 401 });
    }
    return Response.json({ error: 'Não foi possível conectar à API' }, { status: 502 });
  }
}

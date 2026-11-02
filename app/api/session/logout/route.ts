import axios from 'axios';
import publicApi from '@/lib/api';
import { clearSessionTokens, getSessionTokens } from '@/lib/session';

export async function POST() {
  const { accessToken, refreshToken } = await getSessionTokens();

  try {
    await publicApi.post(
      '/auth/logout',
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    // A rota de logout da API exige access token válido. Com 401, os cookies ficam:
    // o interceptor renova a sessão e repete esta chamada, e o refresh token é revogado.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return Response.json({ error: 'Token expirado' }, { status: 401 });
    }
    // Outra falha (API fora do ar): a sessão local acaba do mesmo jeito.
  }

  await clearSessionTokens();
  return Response.json({ message: 'Logout realizado' });
}

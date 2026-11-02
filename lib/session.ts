import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

// Os dois cookies duram o mesmo que o refresh token. Quem decide se o access
// token ainda vale é a API, que responde 401 quando ele expira.
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const cookieOptions = {
  httpOnly: true, // o JavaScript do navegador não lê o token: protege de XSS
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // outro site não consegue fazer POST com estes cookies
  path: '/',
  maxAge: SESSION_MAX_AGE,
};

export async function getSessionTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_COOKIE)?.value,
  };
}

export async function setSessionTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions);
  cookieStore.set(REFRESH_COOKIE, refreshToken, cookieOptions);
}

export async function clearSessionTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

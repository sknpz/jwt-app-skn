import { NextRequest } from 'next/server';
import { API_URL } from '@/lib/api';
import { getSessionTokens } from '@/lib/session';

// Repassa a chamada da tela para a API, trocando o cookie pelo header
// Authorization. Status e corpo voltam como vieram, inclusive o 401 que dispara
// o refresh no interceptor de lib/http.ts.
async function forward(request: NextRequest, context: RouteContext<'/api/v1/[...path]'>) {
  const { path } = await context.params;
  const { accessToken } = await getSessionTokens();
  const url = `${API_URL}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: request.method === 'GET' ? undefined : await request.text(),
      cache: 'no-store',
    });
    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return Response.json({ error: 'Não foi possível conectar à API' }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };

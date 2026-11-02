import { NextRequest, NextResponse } from 'next/server';

// Checagem rápida, só para evitar mostrar a tela errada. Quem valida a sessão de
// verdade é a API. Olha o refresh token porque é ele que mantém a sessão viva:
// o access token pode ter expirado e ser renovado sem o usuário perceber.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has('refreshToken');
  const isLoginPage = req.nextUrl.pathname === '/';

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};

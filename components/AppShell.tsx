'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

// adminOnly só esconde o menu. Quem bloqueia de verdade é a API, com 403.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', adminOnly: false },
  { href: '/dashboard/categories', label: 'Categorias', adminOnly: false },
  { href: '/dashboard/authors', label: 'Autores', adminOnly: false },
  { href: '/dashboard/books', label: 'Livros', adminOnly: false },
  { href: '/dashboard/readers', label: 'Leitores', adminOnly: false },
  { href: '/dashboard/loans', label: 'Empréstimos', adminOnly: false },
  { href: '/dashboard/users', label: 'Atendentes', adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, error, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <header className="topbar">
        <strong className="brand">Biblioteca</strong>
        <nav className="nav">
          {NAV_ITEMS.filter((item) => user?.isAdmin || !item.adminOnly).map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="user">
          {user && <span>{user.name}{user.isAdmin ? ' (admin)' : ''}</span>}
          <button type="button" className="btn btn-light" onClick={logout}>Sair</button>
        </div>
      </header>
      <main className="content">
        {error && <p className="alert alert-error">{error}</p>}
        {children}
      </main>
    </>
  );
}

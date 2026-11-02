'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

// adminOnly só esconde o menu. Quem bloqueia de verdade é a API, com 403.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', adminOnly: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <header className="topbar">
        <strong className="brand">Biblioteca</strong>
        <nav className="nav">
          {NAV_ITEMS.filter((item) => user.isAdmin || !item.adminOnly).map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="user">
          <span>{user.name}{user.isAdmin ? ' (admin)' : ''}</span>
          <button type="button" className="btn btn-light" onClick={logout}>Sair</button>
        </div>
      </header>
      <main className="content">{children}</main>
    </>
  );
}

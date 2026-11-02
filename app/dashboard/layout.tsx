import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/components/AuthProvider';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}

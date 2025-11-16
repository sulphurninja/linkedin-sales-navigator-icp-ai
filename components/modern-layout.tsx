'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModernSidebar } from './modern-sidebar';
import { Header } from './header';
import { Loader2 } from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ModernSidebar
        userEmail={user.email}
        userName={user.name}
        hasLinkedIn={!!user.linkedInId}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

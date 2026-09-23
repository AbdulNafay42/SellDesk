'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShoppingBag } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/signup', '/signup/pending', '/invite'];

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { user, activeBusinessId, activeBusiness, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Super Admin bypass for platform admin route
    if (user && user.platformRole === 'SUPER_ADMIN' && pathname.startsWith('/admin')) {
      return;
    }

    const isPublic = pathname === '/' || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (!user) {
      if (!isPublic) {
        router.push('/login');
      }
      return;
    }

    // Authenticated User Logic:
    // 1. If business status is PENDING, force redirect to /signup/pending for non-pending routes
    if (activeBusiness && activeBusiness.status === 'PENDING') {
      if (pathname !== '/signup/pending') {
        router.push('/signup/pending');
      }
      return;
    }

    // 2. If business status is APPROVED, redirect away from landing or pending screen to /dashboard
    if (activeBusiness && activeBusiness.status === 'APPROVED') {
      if (pathname === '/' || pathname === '/signup/pending') {
        router.push('/dashboard');
        return;
      }
    }

    // 3. If user has no active tenant selected, redirect to select-tenant
    if (!activeBusinessId && pathname !== '/select-tenant' && !isPublic) {
      router.push('/select-tenant');
    }
  }, [isLoading, user, activeBusinessId, activeBusiness, pathname, router]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#090D16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingBag style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
          <Loader2 style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', animation: 'spin 1s linear infinite' }} />
          Verifying SellDesk Session...
        </div>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}

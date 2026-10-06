'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.platformRole !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.platformRole !== 'SUPER_ADMIN') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090D16',
          color: '#9CA3AF',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}
      >
        Authenticating Super-Admin Control Plane...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090D16', color: '#FFFFFF', display: 'flex' }}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <AdminTopbar onMenuToggle={() => setIsSidebarOpen(true)} />

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width, 16.25rem)',
          marginTop: 'var(--header-height, 4rem)',
          padding: '1.75rem',
          minHeight: 'calc(100vh - var(--header-height, 4rem))',
          backgroundColor: '#090D16',
          boxSizing: 'border-box',
          width: 'calc(100% - var(--sidebar-width, 16.25rem))',
          transition: 'margin-left 0.25s ease-in-out, width 0.25s ease-in-out',
        }}
        className="animate-fade-in"
      >
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 1024px) {
          main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 1.25rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

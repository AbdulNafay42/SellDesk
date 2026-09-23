'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Store, MapPin, Shield, CheckCircle2, ArrowRight, LogOut, Loader2 } from 'lucide-react';

export default function SelectTenantPage() {
  const router = useRouter();
  const { user, memberships, activeBusinessId, selectBusiness, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const handleSelect = (businessId: string) => {
    selectBusiness(businessId);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#090D16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '0.9rem',
          gap: '0.5rem',
        }}
      >
        <Loader2 style={{ width: '1.5rem', height: '1.5rem', color: '#10B981', animation: 'spin 1s linear infinite' }} />
        Loading your business memberships...
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#090D16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '32rem',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Top bar with Logout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
              Logged in as
            </span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{user.fullName}</div>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', gap: '0.375rem' }}
          >
            <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
            Sign Out
          </button>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <div
            style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.375rem',
            }}
          >
            <Store style={{ width: '1.75rem', height: '1.75rem', color: '#10B981' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>Select Your Business</h1>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
            Choose an active tenant store to manage orders & operations.
          </p>
        </div>

        {/* Memberships List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {(!memberships || memberships.length === 0) ? (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '0.0625rem solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                textAlign: 'center',
                color: '#FBBF24',
                fontSize: '0.85rem',
              }}
            >
              No active business memberships found for your account. Please contact an administrator or register a new business.
            </div>
          ) : (
            memberships.map((m) => {
              const biz = m.business || {};
              const isSelected = activeBusinessId === biz.id || activeBusinessId === m.businessId;

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelect(biz.id || m.businessId)}
                  style={{
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(17, 24, 39, 0.8)',
                    border: isSelected ? '0.0625rem solid rgba(16, 185, 129, 0.4)' : '0.0625rem solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.875rem',
                    padding: '1.125rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="tenant-item-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.625rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#34D399' : '#818CF8',
                      }}
                    >
                      <Store style={{ width: '1.25rem', height: '1.25rem' }} />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {biz.name || 'Unnamed Business'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin style={{ width: '0.75rem', height: '0.75rem' }} /> {biz.city || 'Pakistan'}
                        </span>
                        <span className={`badge ${m.role === 'OWNER' ? 'badge-success' : 'badge-indigo'}`} style={{ fontSize: '0.65rem' }}>
                          <Shield style={{ width: '0.65rem', height: '0.65rem' }} /> {m.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isSelected ? (
                      <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#34D399' }} />
                    ) : (
                      <ArrowRight style={{ width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx global>{`
        .tenant-item-card:hover {
          border-color: rgba(16, 185, 129, 0.4) !important;
          transform: translateY(-0.0625rem);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

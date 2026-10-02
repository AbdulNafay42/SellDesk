'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Ban, ArrowLeft, LogIn, Store } from 'lucide-react';

function SignupSuspendedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessName = searchParams.get('businessName') || 'Your Business';

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        width: '100%',
        maxWidth: '32rem',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '1.25rem',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '0.0625rem solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ban style={{ width: '2.25rem', height: '2.25rem', color: '#F59E0B' }} />
      </div>

      <div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Store Account Suspended
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9CA3AF' }}>
          Your business account access has been temporarily suspended by platform compliance.
        </p>
      </div>

      {/* Business Details Card */}
      <div
        style={{
          width: '100%',
          background: 'rgba(17, 24, 39, 0.8)',
          border: '0.0625rem solid rgba(245, 158, 11, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', fontSize: '0.825rem' }}>
            <Store style={{ width: '1rem', height: '1rem', color: '#FBBF24' }} />
            Business Name:
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{businessName}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9CA3AF', fontSize: '0.825rem' }}>Status:</span>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
            <Ban style={{ width: '0.75rem', height: '0.75rem' }} /> Account Suspended
          </span>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '0.0625rem solid rgba(245, 158, 11, 0.2)',
          borderRadius: '0.625rem',
          padding: '1rem',
          fontSize: '0.85rem',
          color: '#FBBF24',
          lineHeight: '1.5',
        }}
      >
        Access to active store operations, orders, and API endpoints is blocked while suspended. Please contact platform administrators to restore access.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.25rem' }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="btn-secondary"
          style={{ flex: 1, textDecoration: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Home
        </button>

        <Link
          href="/login"
          className="btn-secondary"
          style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
        >
          <LogIn style={{ width: '1rem', height: '1rem' }} /> Switch Account
        </Link>
      </div>
    </div>
  );
}

export default function SignupSuspendedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#090D16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <Suspense fallback={<div style={{ color: '#FFF' }}>Loading registration status...</div>}>
        <SignupSuspendedContent />
      </Suspense>
    </div>
  );
}

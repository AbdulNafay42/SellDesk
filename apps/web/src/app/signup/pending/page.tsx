'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, CheckCircle2, ShieldAlert, ArrowLeft, LogIn, Store } from 'lucide-react';

function SignupPendingContent() {
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
        <Clock style={{ width: '2.25rem', height: '2.25rem', color: '#F59E0B' }} />
      </div>

      <div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Registration Submitted
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9CA3AF' }}>
          Your business application is under review by the SellDesk platform team.
        </p>
      </div>

      {/* Business Details Card */}
      <div
        style={{
          width: '100%',
          background: 'rgba(17, 24, 39, 0.8)',
          border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
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
            <Store style={{ width: '1rem', height: '1rem', color: '#818CF8' }} />
            Business Name:
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{businessName}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9CA3AF', fontSize: '0.825rem' }}>Status:</span>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
            <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
            Pending Approval
          </span>
        </div>
      </div>

      {/* Explanation Text */}
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '0.0625rem solid rgba(99, 102, 241, 0.2)',
          borderRadius: '0.625rem',
          padding: '1rem',
          fontSize: '0.85rem',
          color: '#A5B4FC',
          lineHeight: '1.5',
        }}
      >
        Your application is currently being reviewed by the SellDesk team. You will receive an invitation once your business is approved.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.875rem', width: '100%', marginTop: '0.5rem' }}>
        <Link
          href="/login"
          className="btn-primary"
          style={{ flex: 1, textDecoration: 'none' }}
        >
          <LogIn style={{ width: '1rem', height: '1rem' }} />
          Sign In
        </Link>

        <Link
          href="/"
          className="btn-secondary"
          style={{ flex: 1, textDecoration: 'none' }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function SignupPendingPage() {
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
        <SignupPendingContent />
      </Suspense>
    </div>
  );
}

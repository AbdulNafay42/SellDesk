'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock, CheckCircle2, ShieldAlert, ArrowLeft, LogIn, Store, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function SignupPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth, memberships } = useAuth();
  const businessName = searchParams.get('businessName') || 'Your Business';

  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [isApprovedNow, setIsApprovedNow] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const freshMemberships = await refreshAuth();
      // Inspect updated memberships
      const matched = freshMemberships.find(
        (m) => (m.business?.name || '').toLowerCase() === businessName.toLowerCase() || m.business?.status === 'APPROVED'
      );

      if (matched && matched.business?.status === 'APPROVED') {
        setIsApprovedNow(true);
        setCheckResult(`🎉 Great news! ${matched.business.name || 'Your business'} has been APPROVED by platform admins! Redirecting...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setCheckResult('Status checked: Your application is still pending platform admin review.');
      }
    } catch {
      setCheckResult('Could not verify status right now. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

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
          background: isApprovedNow ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: isApprovedNow ? '0.0625rem solid rgba(16, 185, 129, 0.3)' : '0.0625rem solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isApprovedNow ? (
          <CheckCircle2 style={{ width: '2.25rem', height: '2.25rem', color: '#34D399' }} />
        ) : (
          <Clock style={{ width: '2.25rem', height: '2.25rem', color: '#F59E0B' }} />
        )}
      </div>

      <div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
          {isApprovedNow ? 'Application Approved!' : 'Registration Submitted'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9CA3AF' }}>
          {isApprovedNow
            ? 'Your store is fully activated on SellDesk platform.'
            : 'Your business application is under review by the SellDesk platform team.'}
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
          <span className={isApprovedNow ? 'badge badge-success' : 'badge badge-warning'} style={{ fontSize: '0.75rem' }}>
            {isApprovedNow ? (
              <>
                <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Approved
              </>
            ) : (
              <>
                <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> Pending Approval
              </>
            )}
          </span>
        </div>
      </div>

      {/* Status Alert Banner if checked */}
      {checkResult && (
        <div
          style={{
            width: '100%',
            background: isApprovedNow ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            border: isApprovedNow ? '0.0625rem solid rgba(16, 185, 129, 0.3)' : '0.0625rem solid rgba(99, 102, 241, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            fontSize: '0.825rem',
            color: isApprovedNow ? '#34D399' : '#A5B4FC',
          }}
        >
          {checkResult}
        </div>
      )}

      {/* Explanation Text */}
      {!isApprovedNow && (
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
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.25rem' }}>
        <button
          type="button"
          disabled={isChecking}
          onClick={handleCheckStatus}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {isChecking ? (
            <>
              <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Checking Status...
            </>
          ) : (
            <>
              <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Re-Check Approval Status
            </>
          )}
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn-secondary"
            style={{ flex: 1, textDecoration: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to Home
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

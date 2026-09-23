'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { KeyRound, Building2, User, Mail, Calendar, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface InvitationDetails {
  valid: boolean;
  business?: {
    id: string;
    name: string;
    status: string;
  };
  owner?: {
    email: string;
    fullName: string;
  };
  expiresAt?: string;
  invitation?: {
    id: string;
    token: string;
    status: string;
    expiresAt: string;
    business: {
      id: string;
      name: string;
      status: string;
    };
    user: {
      id: string;
      email: string;
      fullName: string;
    };
  };
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [invitationData, setInvitationData] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchInvitation = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await api.get<InvitationDetails>(`/api/auth/invitation/${token}`);
        if (data && data.valid) {
          setInvitationData(data);
        } else {
          setFetchError('Invitation token is invalid or has already been used.');
        }
      } catch (err: any) {
        setFetchError(err?.message || 'Unable to load invitation. The link may be expired, invalid, or already used.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);

    if (password !== confirmPassword) {
      setActivationError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 6) {
      setActivationError('Password must be at least 6 characters long.');
      return;
    }

    setIsActivating(true);
    try {
      await api.post('/api/auth/accept-invite', {
        token,
        password,
      });

      setActivationSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setActivationError(err?.message || 'Failed to activate account. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const businessName = invitationData?.business?.name || invitationData?.invitation?.business?.name || 'Your Business Store';
  const ownerFullName = invitationData?.owner?.fullName || invitationData?.invitation?.user?.fullName || 'Business Owner';
  const ownerEmail = invitationData?.owner?.email || invitationData?.invitation?.user?.email || '';
  const expiresAt = invitationData?.expiresAt || invitationData?.invitation?.expiresAt;

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
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '30rem',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1.25rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
            }}
          >
            <KeyRound style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#FFFFFF' }}>Activate Your Account</h1>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
            Set your password to complete your SellDesk business onboarding.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
            <Loader2 style={{ width: '2rem', height: '2rem', color: '#10B981', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Verifying invitation token...</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '0.0625rem solid rgba(244, 63, 94, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                color: '#FDA4AF',
              }}
            >
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Invitation Error</div>
                <div style={{ fontSize: '0.825rem' }}>{fetchError}</div>
              </div>
            </div>

            <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Back to Login
            </Link>
          </div>
        )}

        {/* Success State */}
        {activationSuccess && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', color: '#34D399' }} />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                Account Activated Successfully!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                Your password has been configured. Redirecting you to login...
              </p>
            </div>
          </div>
        )}

        {/* Valid Invitation Form */}
        {!isLoading && !fetchError && !activationSuccess && invitationData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Invitation Details Summary Card */}
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Building2 style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} /> Business:
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {businessName}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <User style={{ width: '0.875rem', height: '0.875rem', color: '#818CF8' }} /> Account Owner:
                </span>
                <span style={{ fontSize: '0.825rem', color: '#E5E7EB' }}>
                  {ownerFullName} {ownerEmail ? `(${ownerEmail})` : ''}
                </span>
              </div>

              {expiresAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#F59E0B' }} /> Expires:
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#FBBF24' }}>
                    {new Date(expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Form Error */}
            {activationError && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '0.0625rem solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#FDA4AF',
                  fontSize: '0.8rem',
                }}
              >
                <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                <span>{activationError}</span>
              </div>
            )}

            {/* Set Password Form */}
            <form onSubmit={handleActivate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.375rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass"
                  disabled={isActivating}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.375rem' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-glass"
                  disabled={isActivating}
                />
              </div>

              <button
                type="submit"
                disabled={isActivating}
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {isActivating ? (
                  <>
                    <Loader2 style={{ width: '1.125rem', height: '1.125rem', animation: 'spin 1s linear infinite' }} />
                    Activating Account...
                  </>
                ) : (
                  <>
                    Activate Account & Sign In
                    <ArrowRight style={{ width: '1.125rem', height: '1.125rem' }} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
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

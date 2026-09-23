'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ShoppingBag, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { memberships } = await login(email, password);

      if (!memberships || memberships.length === 0) {
        setError('Your account has no business memberships associated with it yet.');
        return;
      }

      if (memberships.length === 1) {
        router.push('/');
      } else {
        router.push('/select-tenant');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '28rem',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
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
              marginBottom: '0.5rem',
            }}
          >
            <ShoppingBag style={{ width: '1.75rem', height: '1.75rem', color: '#10B981' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>SellDesk</h1>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
            WhatsApp Commerce & Multi-Tenant Seller Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '0.0625rem solid rgba(244, 63, 94, 0.3)',
              borderRadius: '0.625rem',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              color: '#FDA4AF',
              fontSize: '0.825rem',
            }}
          >
            <AlertCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.375rem' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="owner@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.375rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 style={{ width: '1.125rem', height: '1.125rem', animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn style={{ width: '1.125rem', height: '1.125rem' }} />
                Sign In to Business
              </>
            )}
          </button>
        </form>

        {/* Signup Redirect */}
        <div style={{ textAlign: 'center', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.825rem', color: '#9CA3AF' }}>
            New to SellDesk?{' '}
            <Link
              href="/signup"
              style={{ color: '#34D399', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Register your business <ArrowRight style={{ width: '0.875rem', height: '0.875rem' }} />
            </Link>
          </p>
        </div>
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

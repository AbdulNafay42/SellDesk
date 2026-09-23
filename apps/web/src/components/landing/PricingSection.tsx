'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

export function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#090D16',
        position: 'relative',
        borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.875rem',
              borderRadius: '2rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.25)',
              color: '#34D399',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck style={{ width: '0.9rem', height: '0.9rem' }} />
            <span>Platform Provisioning & Access</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Built for Next-Gen Social Commerce Operations
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#9CA3AF',
              maxWidth: '38rem',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            SellDesk is provisioned directly for authorized clothing and apparel brands in Pakistan. Register your brand store to request platform access.
          </p>
        </div>

        {/* Factual Request Access Card */}
        <div
          className="glass-card"
          style={{
            borderRadius: '1.25rem',
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)',
            border: '0.0625rem solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 1rem 2.5rem rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 style={{ width: '1.35rem', height: '1.35rem', color: '#34D399' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>
                    Client Store Provisioning
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Super Admin Authorization Model</p>
                </div>
              </div>

              <p style={{ fontSize: '0.925rem', color: '#D1D5DB', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Every client brand registers in a pending state. Once verified and approved by a Super Admin, a secure single-use invitation token is generated to complete store setup.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Multi-tenant business isolation via X-Tenant-ID</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Human-in-the-loop AI order verification guardrails</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Real-time size/color variant stock allocation</span>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 0.25rem 1rem rgba(16, 185, 129, 0.3)',
                }}
              >
                <Sparkles style={{ width: '1.35rem', height: '1.35rem', color: '#FFF' }} />
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>
                Ready to Onboard Your Brand?
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Submit your business registration to request account provisioning for your clothing brand.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                <Link
                  href="/signup"
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.9rem',
                    borderRadius: '0.625rem',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <span>Register Store Business</span>
                  <ArrowRight style={{ width: '0.9rem', height: '0.9rem' }} />
                </Link>

                <Link
                  href="/login"
                  className="btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.9rem',
                    borderRadius: '0.625rem',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  Existing Store Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Factual Disclaimer */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.78rem',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
            }}
          >
            <ShieldCheck style={{ width: '0.85rem', height: '0.85rem', color: '#10B981' }} />
            Commercial platform tier terms and store limits are assigned upon Super Admin registration review.
          </p>
        </div>
      </div>
    </section>
  );
}

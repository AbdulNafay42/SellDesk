'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section
      id="cta"
      style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#090D16',
        position: 'relative',
        borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div
          className="glass-card"
          style={{
            borderRadius: '1.5rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(17, 24, 39, 0.8) 100%)',
            border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 1rem 3rem rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Background Accents */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30rem',
              height: '20rem',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '2rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
                color: '#34D399',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles style={{ width: '0.9rem', height: '0.9rem' }} />
              <span>Multi-Tenant Commerce Infrastructure</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                maxWidth: '44rem',
                margin: '0 auto 1.25rem auto',
              }}
            >
              Turn Customer Conversations Into Organized Commerce Operations
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#9CA3AF',
                maxWidth: '36rem',
                margin: '0 auto 2.5rem auto',
                lineHeight: 1.6,
              }}
            >
              Connect your WhatsApp Cloud API, parse incoming chat inquiries with human-in-the-loop AI guardrails, and synchronize variant inventory seamlessly across your store.
            </p>

            {/* Feature Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                marginBottom: '2.5rem',
                fontSize: '0.85rem',
                color: '#D1D5DB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399' }} />
                <span>Multi-Tenant Business Isolation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399' }} />
                <span>Human Order Approval Guardrails</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399' }} />
                <span>Real-Time SKU Variant Sync</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/signup"
                className="btn-primary"
                style={{
                  textDecoration: 'none',
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  borderRadius: '0.75rem',
                }}
              >
                <span>Get Started Now</span>
                <ArrowRight style={{ width: '1.1rem', height: '1.1rem' }} />
              </Link>

              <a
                href="#hero-command-center"
                className="btn-secondary"
                style={{
                  textDecoration: 'none',
                  padding: '0.875rem 1.75rem',
                  fontSize: '1rem',
                  borderRadius: '0.75rem',
                }}
              >
                Explore Command Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

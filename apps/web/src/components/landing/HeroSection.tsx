'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, MessageCircle, Boxes, Truck } from 'lucide-react';
import { HeroCommandCenter } from './HeroCommandCenter';

export function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        paddingTop: '7.5rem',
        paddingBottom: '4rem',
        overflow: 'hidden',
      }}
      className="landing-grid-bg"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
        }}
      >
        {/* Top Product Tag Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '0.0625rem solid rgba(16, 185, 129, 0.25)',
            padding: '0.4rem 0.875rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            color: '#34D399',
            fontWeight: 600,
          }}
        >
          <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
          <span>Multi-Tenant WhatsApp Commerce Operations</span>
        </div>

        {/* Hero Headings & Factual Copy */}
        <div style={{ textAlign: 'center', maxWidth: '52rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: '1.1',
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
            }}
          >
            Turn Conversations Into{' '}
            <span className="gradient-text-whatsapp">Commerce Operations</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: '#9CA3AF',
              lineHeight: '1.6',
              fontWeight: 400,
            }}
          >
            SellDesk transforms unstructured WhatsApp customer messages into structured orders, auto-reserved stock levels, COD payment ledgers, and automated courier dispatches.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '0.5rem',
            }}
          >
            <Link
              href="/signup"
              className="btn-primary"
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.75rem',
                fontSize: '0.95rem',
              }}
            >
              Get Started
              <ArrowRight style={{ width: '1.125rem', height: '1.125rem' }} />
            </Link>

            <a
              href="#command-center"
              className="btn-secondary"
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
              }}
            >
              Explore Command Center
            </a>
          </div>

          {/* Factual Technical Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.75rem',
              marginTop: '0.75rem',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
              color: '#6B7280',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
              Isolated Multi-Tenant Architecture
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MessageCircle style={{ width: '0.875rem', height: '0.875rem', color: '#6366F1' }} />
              WhatsApp Cloud API Webhooks
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Truck style={{ width: '0.875rem', height: '0.875rem', color: '#F59E0B' }} />
              Courier Integration (Slice 9 Roadmap)
            </span>
          </div>
        </div>

        {/* 2.5D Interactive Hero Command Center */}
        <div id="command-center" style={{ width: '100%', marginTop: '0.5rem' }}>
          <HeroCommandCenter />
        </div>
      </div>
    </section>
  );
}

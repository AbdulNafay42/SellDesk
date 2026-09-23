'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer
      id="footer"
      style={{
        backgroundColor: '#060911',
        borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)',
        color: '#9CA3AF',
        padding: '4.5rem 1.5rem 2.5rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0.25rem 1rem rgba(16, 185, 129, 0.3)',
                }}
              >
                <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  SellDesk
                </span>
                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Commerce Platform
                </span>
              </div>
            </Link>

            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', lineHeight: 1.6, maxWidth: '24rem', marginBottom: '1.5rem' }}>
              Multi-tenant SaaS commerce operations platform engineered for Pakistani fashion & apparel brands to convert WhatsApp conversations into structured commerce workflows.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#34D399',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.375rem 0.75rem',
                borderRadius: '1rem',
                border: '0.0625rem solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <CheckCircle2 style={{ width: '0.85rem', height: '0.85rem' }} />
              <span>Platform Core Live • Slice 9 Logistics Roadmap</span>
            </div>
          </div>

          {/* Product Anchors */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <a href="#capabilities" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Capabilities
                </a>
              </li>
              <li>
                <a href="#how-it-works" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Workflow
                </a>
              </li>
              <li>
                <a href="#ai" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>
                  AI Guardrails
                </a>
              </li>
              <li>
                <a href="#operations" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Stock & Logistics
                </a>
              </li>
              <li>
                <a href="#pricing" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Platform Access
                </a>
              </li>
              <li>
                <a href="#faq" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Product FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* User & Client Access */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Client Access
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link href="/signup" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
                  Register Brand Store
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
                  Seller Operational Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" style={{ color: '#818CF8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <ShieldCheck style={{ width: '0.85rem', height: '0.85rem' }} />
                  Super-Admin Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Legal / Copyright */}
        <div
          style={{
            borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#6B7280',
          }}
        >
          <div>
            © 2026 SellDesk SaaS. Multi-tenant WhatsApp Commerce Infrastructure. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#9CA3AF' }}>
            <span>Built for Pakistani D2C Apparel Brands</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

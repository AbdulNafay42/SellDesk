'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowRight, LogIn } from 'lucide-react';

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4.5rem',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(1.25rem)',
        borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '80rem',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

        {/* Desktop Navigation Links */}
        <nav className="search-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <a href="#capabilities" className="landing-nav-link">Capabilities</a>
          <a href="#how-it-works" className="landing-nav-link">Workflow</a>
          <a href="#ai" className="landing-nav-link">AI Guardrails</a>
          <a href="#operations" className="landing-nav-link">Operations</a>
          <a href="#pricing" className="landing-nav-link">Platform Access</a>
          <a href="#faq" className="landing-nav-link">FAQ</a>
        </nav>

        {/* Desktop CTAs */}
        <div className="search-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/login"
            className="btn-secondary"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <LogIn style={{ width: '0.9rem', height: '0.9rem' }} />
            Sign In
          </Link>

          <Link
            href="/signup"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '0.5rem 1.125rem', fontSize: '0.85rem' }}
          >
            Get Started
            <ArrowRight style={{ width: '0.9rem', height: '0.9rem' }} />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          style={{
            display: 'none',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            padding: '0.5rem',
            borderRadius: '0.625rem',
            cursor: 'pointer',
          }}
          className="mobile-toggle-btn"
        >
          {isMobileMenuOpen ? (
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          ) : (
            <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '4.5rem',
            left: 0,
            right: 0,
            background: '#090D16',
            borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            zIndex: 49,
          }}
        >
          <a
            href="#capabilities"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.95rem', padding: '0.35rem 0' }}
          >
            Capabilities
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.95rem', padding: '0.35rem 0' }}
          >
            Workflow
          </a>
          <a
            href="#ai"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.95rem', padding: '0.35rem 0' }}
          >
            AI Guardrails
          </a>
          <a
            href="#operations"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.95rem', padding: '0.35rem 0' }}
          >
            Operations
          </a>
          <a
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.95rem', padding: '0.35rem 0' }}
          >
            Platform Access
          </a>
          <a
            href="#faq"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#FFF', textDecoration: 'none', fontSize: '0.95rem', padding: '0.35rem 0' }}
          >
            FAQ
          </a>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', borderTop: '0.0625rem solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <Link
              href="/login"
              className="btn-secondary"
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary"
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-toggle-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

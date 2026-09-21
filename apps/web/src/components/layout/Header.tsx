'use client';

import React from 'react';
import { Search, Bell, Store, CheckCircle2, MessageCircle, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header style={{
      height: 'var(--header-height)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      background: 'rgba(9, 13, 22, 0.9)',
      backdropFilter: 'blur(1rem)',
      borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      zIndex: 30,
      transition: 'left 0.25s ease-in-out',
    }}>
      {/* Multi-Tenant Business Switcher & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Mobile Hamburger toggle button on screens <= 1024px */}
        <button
          onClick={onMenuToggle}
          className="mobile-menu-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            padding: '0.5rem',
            borderRadius: '0.625rem',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          background: 'rgba(17, 24, 39, 0.8)',
          border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
          padding: '0.375rem 0.875rem',
          borderRadius: '0.625rem',
          cursor: 'pointer',
        }}>
          <Store style={{ width: '1rem', height: '1rem', color: '#10B981' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFF' }}>UrbanThreads PK</span>
          <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>PKR</span>
        </div>

        {/* WhatsApp Webhook Status Badge */}
        <div className="search-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#34D399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.375rem 0.75rem', borderRadius: '1.25rem', border: '0.0625rem solid rgba(16, 185, 129, 0.2)' }}>
          <MessageCircle style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>WhatsApp Cloud API Connected</span>
          <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} />
        </div>
      </div>

      {/* Global Search & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="search-hide-mobile" style={{ position: 'relative', width: '17.5rem' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#6B7280' }} />
          <input
            type="text"
            placeholder="Search orders, SKU, customer phone..."
            className="input-glass"
            style={{ paddingLeft: '2.375rem', fontSize: '0.82rem' }}
          />
        </div>

        <button style={{
          width: '2.375rem',
          height: '2.375rem',
          borderRadius: '0.625rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell style={{ width: '1.125rem', height: '1.125rem' }} />
          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#F43F5E' }} />
        </button>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          header {
            left: 0 !important;
            padding: 0 1rem !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

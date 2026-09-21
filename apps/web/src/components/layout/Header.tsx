'use client';

import React from 'react';
import { Search, Bell, Store, CheckCircle2, MessageCircle } from 'lucide-react';

export function Header() {
  return (
    <header style={{
      height: '70px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      background: 'rgba(9, 13, 22, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 30,
    }}>
      {/* Multi-Tenant Business Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 14px',
          borderRadius: '10px',
          cursor: 'pointer',
        }}>
          <Store style={{ width: '16px', height: '16px', color: '#10B981' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFF' }}>UrbanThreads PK</span>
          <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>PKR</span>
        </div>

        {/* WhatsApp Webhook Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34D399', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <MessageCircle style={{ width: '14px', height: '14px' }} />
          <span>WhatsApp Cloud API Connected</span>
          <CheckCircle2 style={{ width: '12px', height: '12px' }} />
        </div>
      </div>

      {/* Global Search & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B7280' }} />
          <input
            type="text"
            placeholder="Search orders, SKU, customer phone..."
            className="input-glass"
            style={{ paddingLeft: '38px', fontSize: '0.82rem' }}
          />
        </div>

        <button style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell style={{ width: '18px', height: '18px' }} />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E' }} />
        </button>
      </div>
    </header>
  );
}

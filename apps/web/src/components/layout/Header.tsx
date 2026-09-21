'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Store, CheckCircle2, MessageCircle, Menu, ChevronDown, ShieldCheck, Plus } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

// User Personas for RBAC Demo
const personas = [
  {
    id: 'usr-super',
    name: 'Abdul Nafay (Super-Admin)',
    email: 'abdulnafay2005@gmail.com',
    role: 'SUPER_ADMIN',
    allowedBrands: [
      { id: 'biz-default', name: 'SellDesk Apparels PK', city: 'Lahore', role: 'Owner' },
      { id: 'biz-102', name: 'Khaadi Pret Official', city: 'Karachi', role: 'Platform Reviewer' },
      { id: 'biz-103', name: 'Sapphire Eastern Wear', city: 'Lahore', role: 'Platform Reviewer' },
    ],
  },
  {
    id: 'usr-client',
    name: 'Kamran Akmal (Client Brand Owner)',
    email: 'kamran@khaadi.com.pk',
    role: 'CLIENT_SELLER',
    allowedBrands: [
      { id: 'biz-102', name: 'Khaadi Pret Official', city: 'Karachi', role: 'Store Owner' },
    ],
  },
];

export function Header({ onMenuToggle }: HeaderProps) {
  const [currentPersona, setCurrentPersona] = useState(personas[0]); // Default to Super-Admin
  const [activeBrand, setActiveBrand] = useState(personas[0].allowedBrands[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize from localStorage on client side
  React.useEffect(() => {
    try {
      const savedPersona = localStorage.getItem('selldesk_persona');
      const savedBrand = localStorage.getItem('selldesk_active_brand');
      if (savedPersona) {
        const parsedP = JSON.parse(savedPersona);
        setCurrentPersona(parsedP);
      }
      if (savedBrand) {
        const parsedB = JSON.parse(savedBrand);
        setActiveBrand(parsedB);
      }
    } catch {}
  }, []);

  const changeBrandAndPersona = (p: typeof personas[0], b: typeof personas[0]['allowedBrands'][0]) => {
    setCurrentPersona(p);
    setActiveBrand(b);
    setIsDropdownOpen(false);

    try {
      localStorage.setItem('selldesk_persona', JSON.stringify(p));
      localStorage.setItem('selldesk_active_brand', JSON.stringify(b));
      window.dispatchEvent(new Event('selldesk_tenant_changed'));
    } catch {}
  };

  const handlePersonaSwitch = (p: typeof personas[0]) => {
    changeBrandAndPersona(p, p.allowedBrands[0]);
  };

  const handleSelectBrand = (b: typeof personas[0]['allowedBrands'][0]) => {
    changeBrandAndPersona(currentPersona, b);
  };

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

        {/* Brand Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              background: 'rgba(17, 24, 39, 0.9)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
              padding: '0.375rem 0.875rem',
              borderRadius: '0.625rem',
              cursor: 'pointer',
            }}
          >
            <Store style={{ width: '1rem', height: '1rem', color: '#10B981' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFF' }}>{activeBrand.name}</span>
            <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>PKR</span>
            {currentPersona.role === 'SUPER_ADMIN' && (
              <ChevronDown style={{ width: '0.875rem', height: '0.875rem', color: '#9CA3AF' }} />
            )}
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 'calc(100% + 0.5rem)',
                width: '19rem',
                backgroundColor: '#111827',
                border: '0.0625rem solid rgba(255, 255, 255, 0.15)',
                borderRadius: '0.75rem',
                boxShadow: '0 0.875rem 2.5rem rgba(0, 0, 0, 0.8)',
                padding: '0.5rem',
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', padding: '0.5rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)' }}>
                {currentPersona.role === 'SUPER_ADMIN' ? 'Super-Admin Brand Access' : 'Your Isolated Brand Store'}
              </div>

              {currentPersona.allowedBrands.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBrand(b)}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background: activeBrand.id === b.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '0.25rem 0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{b.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{b.city} • {b.role}</div>
                  </div>
                  {activeBrand.id === b.id && <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399' }} />}
                </div>
              ))}

              {/* Super-Admin Only Quick Links */}
              {currentPersona.role === 'SUPER_ADMIN' && (
                <div style={{ borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '0.375rem', marginTop: '0.375rem' }}>
                  <Link
                    href="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#818CF8',
                      textDecoration: 'none',
                      background: 'rgba(99, 102, 241, 0.1)',
                    }}
                  >
                    <ShieldCheck style={{ width: '1rem', height: '1rem' }} />
                    Super-Admin Platform Portal
                  </Link>
                </div>
              )}

              {/* Persona Switch Simulator */}
              <div style={{ borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Simulate User Role View:
                </div>
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaSwitch(p)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: currentPersona.id === p.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      color: currentPersona.id === p.id ? '#FFF' : '#9CA3AF',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.5rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      display: 'block',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
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

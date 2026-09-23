'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Store, CheckCircle2, MessageCircle, Menu, ChevronDown, ShieldCheck, LogOut, User, Building2 } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { user, memberships, activeBusiness, activeBusinessId, selectBusiness, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelectBusiness = (bId: string) => {
    selectBusiness(bId);
    setIsDropdownOpen(false);
  };

  const isSuperAdmin = user?.platformRole === 'SUPER_ADMIN';

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
        {/* Mobile Hamburger toggle button */}
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
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFF' }}>
              {activeBusiness?.name || (memberships.length > 0 ? 'Select Business' : 'No Active Store')}
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>PKR</span>
            {(memberships.length > 1 || isSuperAdmin) && (
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
                Your Authorized Store Tenants
              </div>

              {memberships.map((m) => {
                const biz = m.business || {};
                const isCurrent = activeBusinessId === biz.id || activeBusinessId === m.businessId;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectBusiness(biz.id || m.businessId)}
                    style={{
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      background: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: '0.25rem 0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{biz.name || 'Store'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{biz.city || 'Location'} • {m.role}</div>
                    </div>
                    {isCurrent && <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#34D399' }} />}
                  </div>
                );
              })}

              {/* Super-Admin Link */}
              {isSuperAdmin && (
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
                    Super-Admin Portal
                  </Link>
                </div>
              )}
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

      {/* Global Search & User Profile / Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="search-hide-mobile" style={{ position: 'relative', width: '16rem' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#6B7280' }} />
          <input
            type="text"
            placeholder="Search orders, SKU..."
            className="input-glass"
            style={{ paddingLeft: '2.375rem', fontSize: '0.82rem' }}
          />
        </div>

        {/* User Info & Logout Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF' }}>{user.fullName}</span>
              <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{user.email}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                width: '2.375rem',
                height: '2.375rem',
                borderRadius: '0.625rem',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '0.0625rem solid rgba(244, 63, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FDA4AF',
                cursor: 'pointer',
              }}
            >
              <LogOut style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            Sign In
          </Link>
        )}
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

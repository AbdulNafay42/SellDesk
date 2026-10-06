'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Users,
  Radio,
  CreditCard,
  TrendingUp,
  BarChart3,
  LifeBuoy,
  Bell,
  Activity,
  Lock,
  Settings,
  Store,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AdminNavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  exact?: boolean;
}

export const adminNavigationItems: AdminNavItem[] = [
  { name: 'Platform Overview', href: '/admin', icon: ShieldCheck, exact: true },
  { name: 'Tenant Brands', href: '/admin', icon: Building2, badge: 'Brands', exact: true },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Integrations', href: '/admin/integrations', icon: Radio },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Usage & Costs', href: '/admin/usage', icon: TrendingUp },
  { name: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Support Inspector', href: '/admin/support', icon: LifeBuoy, badge: 'READ-ONLY' },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'System Health', href: '/admin/system-health', icon: Activity },
  { name: 'Security & Audit', href: '/admin/security', icon: Lock },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
  { name: 'Switch to Store View', href: '/dashboard', icon: Store, badge: 'Brand View' },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname() || '/admin';
  const { user, memberships } = useAuth();

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  const navItemsToRender = adminNavigationItems.filter((item) => {
    if (item.href === '/dashboard' && (!memberships || memberships.length === 0)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
          }}
        />
      )}

      <aside
        style={{
          width: '16.25rem',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(1.25rem)',
          borderRight: '0.0625rem solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={isOpen ? 'sidebar-open' : 'sidebar-responsive'}
      >
        {/* Admin Brand Logo Header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.375rem',
              height: '2.375rem',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0.25rem 0.875rem rgba(99, 102, 241, 0.3)',
            }}>
              <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: '#FFF' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                SellDesk <span style={{
                  fontSize: '0.65rem',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818CF8',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  textTransform: 'uppercase'
                }}>Admin</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Platform Control Plane</p>
            </div>
          </div>

          {/* Close button for mobile screen */}
          {onClose && (
            <button
              onClick={onClose}
              className="mobile-close-btn"
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.08em', padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
            SaaS Operations
          </div>
          {navItemsToRender.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : item.href !== '/admin' && pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  marginBottom: '0.25rem',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : '#9CA3AF',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.05) 100%)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '0.1875rem solid #6366F1'
                    : '0.1875rem solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <Icon style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, color: isActive ? '#818CF8' : '#6B7280' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="badge badge-indigo" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1 }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div style={{ padding: '1rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)', background: 'rgba(17, 24, 39, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {userInitials}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>{user?.fullName || 'Super Admin'}</div>
                <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Platform Super Admin</div>
              </div>
            </div>
            <ChevronRight style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .sidebar-responsive {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-close-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

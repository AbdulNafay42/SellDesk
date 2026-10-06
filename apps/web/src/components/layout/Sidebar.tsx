'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Users,
  Package,
  Boxes,
  BellRing,
  BarChart3,
  CreditCard,
  Truck,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  X,
  Building2,
  Store,
  Activity,
  Bell,
  LifeBuoy,
  Radio,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  countKey?: 'orders' | 'followups' | 'payments';
}

// Brand Dashboard Merchant Navigation Items
const brandNavigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare, badge: 'WhatsApp' },
  { name: 'AI Engine', href: '/ai', icon: Sparkles, badge: 'RAG' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, countKey: 'orders' },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products Catalog', href: '/products', icon: Package },
  { name: 'Inventory Sync', href: '/inventory', icon: Boxes },
  { name: 'Follow-ups', href: '/followups', icon: BellRing, countKey: 'followups' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Payments Ledger', href: '/payments', icon: CreditCard, countKey: 'payments' },
  { name: 'Shipping & Couriers', href: '/shipping', icon: Truck },
  { name: 'Returns & Exchanges', href: '/returns', icon: RotateCcw },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Super Admin Platform Control Plane Navigation Items (Strictly SaaS Operations)
const superAdminControlPlaneItems: NavigationItem[] = [
  { name: 'Platform Overview', href: '/admin', icon: ShieldCheck },
  { name: 'Tenant Brands', href: '/admin', icon: Building2, badge: 'Brands' },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Integrations', href: '/admin/integrations', icon: Radio },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Usage & Costs', href: '/admin/usage', icon: TrendingUp },
  { name: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Support Inspector', href: '/admin/support', icon: LifeBuoy, badge: 'Read-Only' },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'System Health', href: '/admin/system-health', icon: Activity },
  { name: 'Security & Audit', href: '/admin/security', icon: Lock },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
  { name: 'Switch to Store View', href: '/dashboard', icon: Store, badge: 'Brand View' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

let globalSidebarCountsCache: { orders: number; followups: number; payments: number } | null = null;

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, activeBusinessId } = useAuth();
  const isSuperAdmin = user?.platformRole === 'SUPER_ADMIN';
  const isAdminRoute = pathname?.startsWith('/admin');

  const [counts, setCounts] = useState<{ orders: number; followups: number; payments: number }>(
    () => globalSidebarCountsCache || { orders: 0, followups: 0, payments: 0 }
  );

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      if (!activeBusinessId || isAdminRoute) return;
      try {
        const data = await api.get<{ orders: number; followups: number; payments: number }>('/api/analytics/counts');
        if (isMounted && data) {
          const newCounts = {
            orders: data.orders ?? 0,
            followups: data.followups ?? 0,
            payments: data.payments ?? 0,
          };
          globalSidebarCountsCache = newCounts;
          setCounts(newCounts);
        }
      } catch (err) {
        try {
          const [ordersData, followupsData, paymentsData] = await Promise.all([
            api.get<any[]>('/api/orders').catch(() => []),
            api.get<any[]>('/api/followups').catch(() => []),
            api.get<any[]>('/api/payments').catch(() => []),
          ]);
          if (isMounted) {
            const fallbackCounts = {
              orders: Array.isArray(ordersData) ? ordersData.length : 0,
              followups: Array.isArray(followupsData) ? followupsData.length : 0,
              payments: Array.isArray(paymentsData) ? paymentsData.length : 0,
            };
            globalSidebarCountsCache = fallbackCounts;
            setCounts(fallbackCounts);
          }
        } catch (fallbackErr) {
          console.error('Failed to load dynamic sidebar counts:', fallbackErr);
        }
      }
    };

    fetchCounts();

    const handleUpdate = () => {
      fetchCounts();
    };

    window.addEventListener('selldesk-counts-update', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('selldesk-counts-update', handleUpdate);
    };
  }, [activeBusinessId, isAdminRoute]);

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SD';

  const activeNavigationList = isAdminRoute
    ? superAdminControlPlaneItems
    : brandNavigationItems;

  return (
    <>
      {/* Mobile Backdrop Overlay for screens <= 1024px */}
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
        {/* Brand Logo Header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.375rem',
              height: '2.375rem',
              borderRadius: '0.625rem',
              background: isAdminRoute
                ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isAdminRoute
                ? '0 0.25rem 0.875rem rgba(99, 102, 241, 0.3)'
                : '0 0.25rem 0.875rem rgba(16, 185, 129, 0.3)'
            }}>
              {isAdminRoute ? (
                <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: '#FFF' }} />
              ) : (
                <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#FFF' }} />
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                SellDesk <span style={{
                  fontSize: '0.65rem',
                  background: isAdminRoute ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isAdminRoute ? '#818CF8' : '#34D399',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  textTransform: 'uppercase'
                }}>{isAdminRoute ? 'Admin' : 'SaaS'}</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{isAdminRoute ? 'Platform Control Plane' : 'WhatsApp Commerce'}</p>
            </div>
          </div>

          {/* Close drawer button on mobile ONLY */}
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

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.08em', padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
            {isAdminRoute ? 'SaaS Operations' : 'Main Menu'}
          </div>
          {activeNavigationList.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const countValue = !isAdminRoute && item.countKey ? counts[item.countKey] : undefined;

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
                    ? (isAdminRoute ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)')
                    : 'transparent',
                  borderLeft: isActive
                    ? (isAdminRoute ? '0.1875rem solid #6366F1' : '0.1875rem solid #10B981')
                    : '0.1875rem solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <Icon style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, color: isActive ? (isAdminRoute ? '#818CF8' : '#34D399') : '#6B7280' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={isAdminRoute ? 'badge badge-indigo' : 'badge badge-success'} style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1 }}>{item.badge}</span>
                )}
                {countValue !== undefined && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.1)', color: '#D1D5DB', padding: '0.125rem 0.5rem', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {countValue}
                  </span>
                )}
              </Link>
            );
          })}

          {/* If Super Admin is viewing Brand Dashboard, provide explicit switcher link at bottom of nav */}
          {isSuperAdmin && !isAdminRoute && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)' }}>
              <Link
                href="/admin"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#818CF8',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '0.0625rem solid rgba(99, 102, 241, 0.25)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <ShieldCheck style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, color: '#818CF8' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Super-Admin Portal</span>
                </div>
                <span className="badge badge-indigo" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1 }}>Platform</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Account Footprint */}
        <div style={{ padding: '1rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)', background: 'rgba(17, 24, 39, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {userInitials}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>{user?.fullName || 'Seller Account'}</div>
                <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                  {isSuperAdmin ? 'Platform Super Admin' : (user?.email || '')}
                </div>
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

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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const navigationItems = [
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
  { name: 'Super-Admin Portal', href: '/admin', icon: ShieldCheck, badge: 'Platform' },
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

  const [counts, setCounts] = useState<{ orders: number; followups: number; payments: number }>(
    () => globalSidebarCountsCache || { orders: 0, followups: 0, payments: 0 }
  );

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      if (!activeBusinessId) return;
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
        // Fallback in case endpoint is unavailable
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
  }, [activeBusinessId]);

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SD';

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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0.25rem 0.875rem rgba(16, 185, 129, 0.3)'
            }}>
              <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#FFF' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                SellDesk <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', textTransform: 'uppercase' }}>SaaS</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>WhatsApp Commerce</p>
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
            Main Menu
          </div>
          {navigationItems
            .filter((item) => isSuperAdmin || item.href !== '/admin')
            .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const countValue = item.countKey ? counts[item.countKey as keyof typeof counts] : undefined;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.625rem',
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                    background: isActive ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
                    borderLeft: isActive ? '0.1875rem solid #10B981' : '0.1875rem solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{ width: '1.125rem', height: '1.125rem', color: isActive ? '#34D399' : '#6B7280' }} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.125rem 0.375rem' }}>{item.badge}</span>
                  )}
                  {countValue !== undefined && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.1)', color: '#D1D5DB', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>
                      {countValue}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Seller Account Footprint */}
        <div style={{ padding: '1rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)', background: 'rgba(17, 24, 39, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {userInitials}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>{user?.fullName || 'Seller Account'}</div>
                <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{user?.email || ''}</div>
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


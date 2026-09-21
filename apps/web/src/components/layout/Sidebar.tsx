'use client';

import React from 'react';
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
  Settings,
  Sparkles,
  ChevronRight,
  Bot,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare, badge: 'WhatsApp' },
  { name: 'AI Engine', href: '/ai', icon: Sparkles, badge: 'RAG' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, count: 12 },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products Catalog', href: '/products', icon: Package },
  { name: 'Inventory Sync', href: '/inventory', icon: Boxes },
  { name: 'Follow-ups', href: '/followups', icon: BellRing, count: 27 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(11, 15, 25, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
    }}>
      {/* Brand Logo Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
        }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#FFF' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
            SellDesk <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>SaaS</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>WhatsApp Commerce</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.08em', padding: '8px 12px', marginBottom: '4px' }}>
          Main Menu
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '4px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                background: isActive ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon style={{ width: '18px', height: '18px', color: isActive ? '#34D399' : '#6B7280' }} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{item.badge}</span>
              )}
              {item.count && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.1)', color: '#D1D5DB', padding: '2px 8px', borderRadius: '999px' }}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Seller Account Footprint */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(17, 24, 39, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              AN
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>Abdul Nafay</div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>abdulnafay2005@gmail.com</div>
            </div>
          </div>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#6B7280' }} />
        </div>
      </div>
    </aside>
  );
}

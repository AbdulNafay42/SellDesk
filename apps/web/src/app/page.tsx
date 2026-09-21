'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  MessageCircle,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<{ id: string; name: string; city: string }>({
    id: 'biz-default',
    name: 'SellDesk Apparels PK',
    city: 'Lahore',
  });
  const [activeUser, setActiveUser] = useState<{ name: string; role: string }>({
    name: 'Abdul',
    role: 'SUPER_ADMIN',
  });

  const updateTenantState = React.useCallback(() => {
    try {
      const savedBrand = localStorage.getItem('selldesk_active_brand');
      const savedPersona = localStorage.getItem('selldesk_persona');
      if (savedBrand) {
        setActiveBrand(JSON.parse(savedBrand));
      }
      if (savedPersona) {
        const p = JSON.parse(savedPersona);
        const firstName = p.name.split(' ')[0];
        setActiveUser({ name: firstName, role: p.role });
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    updateTenantState();
    window.addEventListener('selldesk_tenant_changed', updateTenantState);
    return () => window.removeEventListener('selldesk_tenant_changed', updateTenantState);
  }, [updateTenantState]);

  // Dynamic brand metrics
  const isKhaadi = activeBrand.id === 'biz-102';
  const isSapphire = activeBrand.id === 'biz-103';

  const totalSales = isKhaadi ? 'Rs 2,940,000' : isSapphire ? 'Rs 1,450,000' : 'Rs 485,400';
  const orderCount = isKhaadi ? '842 Orders' : isSapphire ? '420 Orders' : '141 Orders';
  const pendingCount = isKhaadi ? '48 pending dispatch' : isSapphire ? '22 pending dispatch' : '12 pending confirmation';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{
        backgroundColor: '#090D16',
        width: '100%'
      }} className="animate-fade-in">
        {/* Welcome Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>
              Good afternoon, <span className="gradient-text-whatsapp">{activeUser.name}</span> 👋
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Here is what’s happening with <strong style={{ color: '#34D399' }}>{activeBrand.name} ({activeBrand.city})</strong> today.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/products" className="btn-primary" style={{ textDecoration: 'none' }}>
              <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Executive Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {/* Card 1: Total Sales */}
          <div className="glass-card" style={{ padding: '1.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9CA3AF', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sales</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '0.625rem' }}>
                <TrendingUp style={{ width: '1.125rem', height: '1.125rem', color: '#10B981' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{totalSales}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#34D399', marginTop: '0.5rem' }}>
              <ArrowUpRight style={{ width: '0.875rem', height: '0.875rem' }} />
              <span>+18.4% from last week</span>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="glass-card" style={{ padding: '1.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9CA3AF', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</span>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.5rem', borderRadius: '0.625rem' }}>
                <ShoppingBag style={{ width: '1.125rem', height: '1.125rem', color: '#6366F1' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{orderCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
              {pendingCount}
            </div>
          </div>

          {/* Card 3: Pending Follow-ups */}
          <div className="glass-card" style={{ padding: '1.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9CA3AF', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow-ups</span>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.5rem', borderRadius: '0.625rem' }}>
                <Clock style={{ width: '1.125rem', height: '1.125rem', color: '#F59E0B' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>27 Leads</div>
            <div style={{ fontSize: '0.78rem', color: '#FBBF24', marginTop: '0.5rem' }}>
              Automated reminders active
            </div>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className="glass-card" style={{ padding: '1.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9CA3AF', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock</span>
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '0.5rem', borderRadius: '0.625rem' }}>
                <AlertTriangle style={{ width: '1.125rem', height: '1.125rem', color: '#F43F5E' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>3 Variants</div>
            <div style={{ fontSize: '0.78rem', color: '#FDA4AF', marginTop: '0.5rem' }}>
              Black Hoodie XL (3 left)
            </div>
          </div>
        </div>

        {/* Main Section Grid */}
        <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Recent Orders Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>Recent WhatsApp Orders</h2>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Live order extraction from WhatsApp conversations</p>
              </div>
              <button className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>View All</button>
            </div>

            <div className="table-responsive-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '32rem' }}>
                <thead>
                  <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Order</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Product</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Total</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '#ORD-1042', name: 'Ahmed Khan', phone: '0300-4829102', item: 'Oversized Black Hoodie (XL)', total: 'Rs 4,499', status: 'NEW', badge: 'badge-indigo' },
                    { id: '#ORD-1041', name: 'Fatima Zohra', phone: '0321-9920144', item: 'Vintage Wash Denim (M)', total: 'Rs 6,200', status: 'CONFIRMED', badge: 'badge-success' },
                    { id: '#ORD-1040', name: 'Usman Ali', phone: '0333-1029384', item: 'Essential White Tee (L)', total: 'Rs 1,999', status: 'PACKED', badge: 'badge-warning' },
                    { id: '#ORD-1039', name: 'Zainab Bibi', phone: '0345-5544332', item: 'Black Hoodie (M)', total: 'Rs 4,499', status: 'SHIPPED', badge: 'badge-success' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 700, color: '#34D399' }}>{row.id}</td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#FFF' }}>{row.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{row.phone}</div>
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: '#D1D5DB' }}>{row.item}</td>
                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 700, color: '#FFF' }}>{row.total}</td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <span className={`badge ${row.badge}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Intelligence Live Activity Widget */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles style={{ width: '1.125rem', height: '1.125rem', color: '#10B981' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>AI Intent Engine</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.875rem', borderRadius: '0.75rem', border: '0.0625rem solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399' }}>ORDER_EXTRACTION</span>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>2 mins ago</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#E5E7EB', fontStyle: 'italic' }}>
                  &ldquo;2 black XL COD Lahore&rdquo;
                </p>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.375rem', borderRadius: '0.375rem' }}>
                  Extracted: 2x Hoodie (XL), COD, City: Lahore
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.875rem', borderRadius: '0.75rem', border: '0.0625rem solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FBBF24' }}>STOCK_CHECK</span>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>14 mins ago</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#E5E7EB', fontStyle: 'italic' }}>
                  &ldquo;Denim jacket size L available?&rdquo;
                </p>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.375rem', borderRadius: '0.375rem' }}>
                  AI Auto-replied: &ldquo;Yes! 5 remaining (Rs 6,200)&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

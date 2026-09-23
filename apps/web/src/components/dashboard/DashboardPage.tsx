'use client';

import React, { useEffect, useState } from 'react';
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

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, activeBusiness, activeBusinessId } = useAuth();

  const [metrics, setMetrics] = useState<{
    grossRevenuePKR: number;
    totalOrdersCount: number;
    revenueGrowthPercent: number;
  }>({ grossRevenuePKR: 0, totalOrdersCount: 0, revenueGrowthPercent: 0 });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      if (!activeBusinessId) return;
      try {
        const [mRes, oRes] = await Promise.all([
          api.get<any>('/api/analytics/metrics').catch(() => null),
          api.get<any[]>('/api/orders').catch(() => []),
        ]);
        if (isMounted) {
          if (mRes) {
            setMetrics({
              grossRevenuePKR: mRes.grossRevenuePKR || 0,
              totalOrdersCount: mRes.totalOrdersCount || 0,
              revenueGrowthPercent: mRes.revenueGrowthPercent || 0,
            });
          }
          if (Array.isArray(oRes)) {
            setRecentOrders(oRes);
          }
        }
      } catch (err) {
        console.error('Failed to load tenant dashboard metrics:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [activeBusinessId]);

  const activeUserName = user?.fullName ? user.fullName.split(' ')[0] : 'Seller';
  const businessName = activeBusiness?.name || 'Your Business';
  const businessCity = activeBusiness?.city || 'Pakistan';

  const formattedSales = `Rs ${metrics.grossRevenuePKR.toLocaleString()}`;
  const formattedOrderCount = `${metrics.totalOrdersCount} Orders`;

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
              Good afternoon, <span className="gradient-text-whatsapp">{activeUserName}</span> 👋
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Here is what’s happening with <strong style={{ color: '#34D399' }}>{businessName} ({businessCity})</strong> today.
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{formattedSales}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#34D399', marginTop: '0.5rem' }}>
              <ArrowUpRight style={{ width: '0.875rem', height: '0.875rem' }} />
              <span>+{metrics.revenueGrowthPercent}% from last period</span>
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{formattedOrderCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
              {recentOrders.length} active order records
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>0 Leads</div>
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>0 Variants</div>
            <div style={{ fontSize: '0.78rem', color: '#FDA4AF', marginTop: '0.5rem' }}>
              Stock monitor active
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
              <Link href="/orders" className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}>View All</Link>
            </div>

            <div className="table-responsive-container">
              {recentOrders.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                  <ShoppingBag style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem auto', color: '#4B5563' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E5E7EB' }}>No orders yet</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                    When customers place orders, they will appear here automatically.
                  </div>
                </div>
              ) : (
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
                    {recentOrders.slice(0, 5).map((ord, i) => (
                      <tr key={ord.id || i} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '0.875rem 0.5rem', fontWeight: 700, color: '#34D399' }}>{ord.orderNumber || ord.id}</td>
                        <td style={{ padding: '0.875rem 0.5rem' }}>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{ord.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{ord.customerPhone}</div>
                        </td>
                        <td style={{ padding: '0.875rem 0.5rem', color: '#D1D5DB' }}>{ord.productName}</td>
                        <td style={{ padding: '0.875rem 0.5rem', fontWeight: 700, color: '#FFF' }}>Rs {ord.totalAmount?.toLocaleString()}</td>
                        <td style={{ padding: '0.875rem 0.5rem' }}>
                          <span className="badge badge-indigo">{ord.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

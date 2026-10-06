'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, RefreshCw, Building2, Users, ShoppingBag, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/admin/analytics');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch platform analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user?.platformRole !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
      fetchData();
    }
  }, [authLoading, user]);

  return (
    <div style={{ color: '#F9FAFB' }}>
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF', lineHeight: 1.25 }}>
            <BarChart3 style={{ width: '1.75rem', height: '1.75rem', color: '#818CF8', flexShrink: 0 }} /> SaaS Platform Growth Analytics
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Macro platform performance metrics calculated strictly from live database records.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="admin-action-btn-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818CF8',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Analytics
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Calculating platform analytics...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Main KPI Grid */}
          <div className="admin-metrics-grid">
            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Tenant Brands</span>
                <Building2 style={{ width: '1.125rem', height: '1.125rem', color: '#818CF8', flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>
                {data?.overview?.totalBrands || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.2rem' }}>
                {data?.overview?.activeBrands || 0} Active
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Platform Users</span>
                <Users style={{ width: '1.125rem', height: '1.125rem', color: '#34D399', flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>
                {data?.overview?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>Registered accounts</div>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Orders</span>
                <ShoppingBag style={{ width: '1.125rem', height: '1.125rem', color: '#FBBF24', flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>
                {data?.overview?.totalOrders || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>Cross-tenant volume</div>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>WhatsApp Traffic</span>
                <MessageSquare style={{ width: '1.125rem', height: '1.125rem', color: '#60A5FA', flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>
                {data?.overview?.totalMessages || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>Messages processed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

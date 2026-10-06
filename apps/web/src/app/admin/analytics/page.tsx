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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <BarChart3 style={{ width: '2rem', height: '2rem', color: '#818CF8' }} /> SaaS Platform Growth Analytics
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Macro platform performance metrics calculated strictly from live database records.
          </p>
        </div>
        <button
          onClick={fetchData}
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
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Main KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Total Tenant Brands</span>
                <Building2 style={{ width: '1.25rem', height: '1.25rem', color: '#818CF8' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginTop: '0.5rem' }}>
                {data?.overview?.totalBrands || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#34D399', marginTop: '0.25rem' }}>
                {data?.overview?.activeBrands || 0} Approved & Active
              </div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Total Platform Users</span>
                <Users style={{ width: '1.25rem', height: '1.25rem', color: '#34D399' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginTop: '0.5rem' }}>
                {data?.overview?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>Registered user accounts</div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Total Orders Processed</span>
                <ShoppingBag style={{ width: '1.25rem', height: '1.25rem', color: '#FBBF24' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginTop: '0.5rem' }}>
                {data?.overview?.totalOrders || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>Cross-tenant volume</div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>WhatsApp Traffic</span>
                <MessageSquare style={{ width: '1.25rem', height: '1.25rem', color: '#60A5FA' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginTop: '0.5rem' }}>
                {data?.overview?.totalMessages || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>Messages processed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

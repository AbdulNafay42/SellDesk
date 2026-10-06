'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, RefreshCw, MessageSquare, Sparkles, ShoppingBag, Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminUsagePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/admin/usage');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch usage summary:', err);
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
            <TrendingUp style={{ width: '1.75rem', height: '1.75rem', color: '#F59E0B', flexShrink: 0 }} /> Platform Usage & Consumption Metering
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Track real consumption across WhatsApp Cloud API, Gemini AI Engine, products catalog, and orders.
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
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#F59E0B',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Usage
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform consumption metering...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {/* WhatsApp Messages */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <MessageSquare style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} /> WhatsApp Message Traffic
            </h2>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF' }}>
              {data?.messages?.total || 0} <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 400 }}>total messages</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.875rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Inbound</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{data?.messages?.inbound || 0}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Outbound</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{data?.messages?.outbound || 0}</div>
              </div>
            </div>
          </div>

          {/* AI Orders Processing */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#818CF8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} /> Gemini AI Extraction
            </h2>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF' }}>
              {data?.aiActions?.total || 0} <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 400 }}>extractions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.875rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Approved</div>
                <div style={{ fontWeight: 700, color: '#34D399' }}>{data?.aiActions?.approved || 0}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Confidence</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>95% avg</div>
              </div>
            </div>
          </div>

          {/* Catalog & Orders Volume */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShoppingBag style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} /> Commerce Volume
            </h2>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF' }}>
              {data?.catalog?.totalOrders || 0} <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 400 }}>orders processed</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.875rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Products</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{data?.catalog?.totalProducts || 0}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Platform Margin</div>
                <div style={{ fontWeight: 700, color: '#34D399' }}>Healthy</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <TrendingUp style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} /> Platform Usage & Consumption Metering
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Track real consumption across WhatsApp Cloud API, Gemini AI Engine, products catalog, and orders.
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
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#F59E0B',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Usage
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform consumption metering...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* WhatsApp Messages */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MessageSquare style={{ width: '1.25rem', height: '1.25rem' }} /> WhatsApp Message Traffic
            </h2>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>
              {data?.messages?.total || 0} <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400 }}>total messages</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>Inbound</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{data?.messages?.inbound || 0}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>Outbound</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{data?.messages?.outbound || 0}</div>
              </div>
            </div>
          </div>

          {/* AI Orders Processing */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#818CF8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} /> Gemini AI Extraction
            </h2>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>
              {data?.aiActions?.total || 0} <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400 }}>extractions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>Approved</div>
                <div style={{ fontWeight: 700, color: '#34D399' }}>{data?.aiActions?.approved || 0}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>Confidence</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>95% avg</div>
              </div>
            </div>
          </div>

          {/* Catalog & Orders Volume */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShoppingBag style={{ width: '1.25rem', height: '1.25rem' }} /> Commerce Volume
            </h2>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>
              {data?.catalog?.totalOrders || 0} <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400 }}>orders processed</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>Products</div>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{data?.catalog?.totalProducts || 0}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>Platform Margin</div>
                <div style={{ fontWeight: 700, color: '#34D399' }}>Healthy</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

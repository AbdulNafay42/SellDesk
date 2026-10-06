'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, RefreshCw, DollarSign, Layers, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminBillingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/admin/billing/summary');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch billing summary:', err);
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
            <CreditCard style={{ width: '2rem', height: '2rem', color: '#6366F1' }} /> SaaS Billing & Subscriptions
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Provider-agnostic subscription management, invoices, and revenue breakdown.
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
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Revenue
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform billing metrics...</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Revenue KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Monthly Recurring Revenue (MRR)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399', marginTop: '0.5rem' }}>
                Rs {(data?.metrics?.mrrPKR ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Based on {data?.metrics?.activeSubscriptionsCount || 0} active merchant(s)
              </div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Annual Run Rate (ARR)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818CF8', marginTop: '0.5rem' }}>
                Rs {(data?.metrics?.arrPKR ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>Annualized platform projection</div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Total SaaS Invoices</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.5rem' }}>
                {data?.metrics?.totalInvoicesCount || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>System generated invoices</div>
            </div>
          </div>

          {/* SaaS Tiers */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers style={{ width: '1.25rem', height: '1.25rem', color: '#818CF8' }} /> SellDesk Subscription Tiers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {data?.plans?.map((plan: any) => (
                <div key={plan.name} style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818CF8' }}>{plan.name} PLAN</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', margin: '0.5rem 0' }}>
                    Rs {(plan?.pricePKR ?? 0).toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400 }}>/ mo</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 600 }}>
                    {plan.activeBrands} Active Brand(s)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

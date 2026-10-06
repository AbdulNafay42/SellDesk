'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Radio, RefreshCw, CheckCircle2, AlertTriangle, Shield, Smartphone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminIntegrationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/admin/integrations');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch integrations summary:', err);
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
            <Radio style={{ width: '2rem', height: '2rem', color: '#34D399' }} /> Integrations Health Control Plane
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Monitor WhatsApp Cloud API and Instagram DM provider status across all brands.
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Health
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform integrations health...</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>WhatsApp Configured Stores</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399', marginTop: '0.5rem' }}>
                {data?.whatsApp?.totalConfigured || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                {data?.whatsApp?.activeCount || 0} Active WABA Account(s)
              </div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Instagram DM Pipeline</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818CF8', marginTop: '0.5rem' }}>
                {data?.instagram?.totalConfigured || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#818CF8', marginTop: '0.25rem' }}>
                Status: {data?.instagram?.status || 'PLANNED'}
              </div>
            </div>
          </div>

          {/* Configured WhatsApp Providers Table */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
              Configured Meta WhatsApp Business Accounts (WABA)
            </div>
            {data?.whatsApp?.providers?.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>No WhatsApp integrations configured yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(31, 41, 55, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                    <th style={{ padding: '1rem' }}>Brand</th>
                    <th style={{ padding: '1rem' }}>Phone Number ID</th>
                    <th style={{ padding: '1rem' }}>WABA ID</th>
                    <th style={{ padding: '1rem' }}>Display Number</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Access Token</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.whatsApp?.providers?.map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#FFF' }}>{p.businessName}</td>
                      <td style={{ padding: '1rem', color: '#D1D5DB', fontFamily: 'monospace' }}>{p.phoneNumberId}</td>
                      <td style={{ padding: '1rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{p.wabaId}</td>
                      <td style={{ padding: '1rem', color: '#34D399' }}>{p.displayPhoneNumber}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: p.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: p.isActive ? '#34D399' : '#F87171',
                        }}>
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        •••••••• (Redacted)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

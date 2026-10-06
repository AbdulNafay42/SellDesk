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
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF', lineHeight: 1.25 }}>
            <Radio style={{ width: '1.75rem', height: '1.75rem', color: '#34D399', flexShrink: 0 }} /> Integrations Health Control Plane
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Monitor WhatsApp Cloud API and Instagram DM provider status across all brands.
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Health
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform integrations health...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Summary Cards */}
          <div className="admin-metrics-grid">
            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>WhatsApp Configured Stores</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>
                {data?.whatsApp?.totalConfigured || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                {data?.whatsApp?.activeCount || 0} Active WABA Account(s)
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Instagram DM Pipeline</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8', marginTop: '0.25rem' }}>
                {data?.instagram?.totalConfigured || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#818CF8', marginTop: '0.2rem' }}>
                Status: {data?.instagram?.status || 'PLANNED'}
              </div>
            </div>
          </div>

          {/* Configured WhatsApp Providers Table */}
          <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.5rem 0.5rem 1rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
              Configured Meta WhatsApp Business Accounts (WABA)
            </div>
            {data?.whatsApp?.providers?.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>No WhatsApp integrations configured yet.</div>
            ) : (
              <div className="table-responsive-container">
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                      <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Brand</th>
                      <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Phone Number ID</th>
                      <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>WABA ID</th>
                      <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Display Number</th>
                      <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Access Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.whatsApp?.providers?.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap' }}>{p.businessName}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#D1D5DB', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{p.phoneNumberId}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{p.wabaId}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#34D399', whiteSpace: 'nowrap' }}>{p.displayPhoneNumber}</td>
                        <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
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
                        <td style={{ padding: '0.875rem 1rem', color: '#6B7280', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          •••••••• (Redacted)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

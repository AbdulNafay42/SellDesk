'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, RefreshCw, CheckCircle2, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminSystemHealthPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/admin/system-health');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
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
            <Activity style={{ width: '1.75rem', height: '1.75rem', color: '#10B981', flexShrink: 0 }} /> Real-Time System Health Control
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Live status monitoring for database connectivity, NestJS API, Meta integrations, and AI services.
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
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Ping Health Checks
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Running real-time health diagnostics...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.5rem 0.5rem 1rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, fontSize: '1rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Platform Service Nodes</span>
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 400 }}>Checked at: {new Date(data?.checkedAt).toLocaleTimeString()}</span>
            </div>

            <div className="table-responsive-container">
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Service Node</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.services?.map((s: any) => (
                    <tr key={s.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap' }}>{s.name}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{s.type}</td>
                      <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: s.status === 'HEALTHY' ? 'rgba(16, 185, 129, 0.2)' : s.status === 'PLANNED' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: s.status === 'HEALTHY' ? '#34D399' : s.status === 'PLANNED' ? '#818CF8' : '#F87171',
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#D1D5DB', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {s.latencyMs > 0 ? `${s.latencyMs} ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

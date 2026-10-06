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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <Activity style={{ width: '2rem', height: '2rem', color: '#10B981' }} /> Real-Time System Health Control
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Live status monitoring for database connectivity, NestJS API, Meta integrations, and AI services.
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
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Ping Health Checks
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Running real-time health diagnostics...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, fontSize: '1rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Platform Service Nodes</span>
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400 }}>Checked at: {new Date(data?.checkedAt).toLocaleTimeString()}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(31, 41, 55, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                  <th style={{ padding: '1rem' }}>Service Node</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {data?.services?.map((s: any) => (
                  <tr key={s.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#FFF' }}>{s.name}</td>
                    <td style={{ padding: '1rem', color: '#9CA3AF' }}>{s.type}</td>
                    <td style={{ padding: '1rem' }}>
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
                    <td style={{ padding: '1rem', color: '#D1D5DB', fontFamily: 'monospace' }}>
                      {s.latencyMs > 0 ? `${s.latencyMs} ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

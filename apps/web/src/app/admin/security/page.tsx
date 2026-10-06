'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, RefreshCw, Shield, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminSecurityAuditPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [subTab, setSubTab] = useState<'audit' | 'webhooks'>('audit');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (subTab === 'audit') {
        const res = await api.get<any[]>('/api/admin/security/audit-logs');
        setAuditLogs(Array.isArray(res) ? res : []);
      } else {
        const res = await api.get<any[]>('/api/admin/security/webhook-logs');
        setWebhookLogs(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
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
  }, [authLoading, user, subTab]);

  return (
    <div style={{ color: '#F9FAFB' }}>
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF', lineHeight: 1.25 }}>
            <Lock style={{ width: '1.75rem', height: '1.75rem', color: '#818CF8', flexShrink: 0 }} /> Security & Platform Audit Trail
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Immutable administrative audit logs and webhook event history. Secrets are redacted automatically.
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
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Trail
        </button>
      </div>

      {/* Subtab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSubTab('audit')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: subTab === 'audit' ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
            color: subTab === 'audit' ? '#FFF' : '#9CA3AF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setSubTab('webhooks')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: subTab === 'webhooks' ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
            color: subTab === 'webhooks' ? '#FFF' : '#9CA3AF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Webhook Event Logs
        </button>
      </div>

      {/* Log Table */}
      <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading security logs...</div>
        ) : subTab === 'audit' ? (
          auditLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No audit logs recorded yet.</div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Admin Actor</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Action</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Entity</th>
                    <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap' }}>{log.actorEmail}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#818CF8', fontWeight: 700, whiteSpace: 'nowrap' }}>{log.action}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#E5E7EB', whiteSpace: 'nowrap' }}>{log.entityType}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#D1D5DB' }}>{log.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : webhookLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No webhook logs recorded yet.</div>
        ) : (
          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Provider</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Event</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>HTTP Status</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#34D399', whiteSpace: 'nowrap' }}>{log.provider}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#FFF', whiteSpace: 'nowrap' }}>{log.event}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: log.status === 'PROCESSED' ? '#34D399' : '#F87171', whiteSpace: 'nowrap' }}>{log.status}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{log.httpStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

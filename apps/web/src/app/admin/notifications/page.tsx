'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, RefreshCw, AlertTriangle, Info, CheckCircle2, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/admin/notifications');
      setNotifications(Array.isArray(res?.notifications) ? res.notifications : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
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
            <Bell style={{ width: '1.75rem', height: '1.75rem', color: '#F59E0B', flexShrink: 0 }} /> SaaS Platform Notifications & Alerts
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            System-level notifications requiring platform administrative attention.
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
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Alerts
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{
          padding: '3rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '0.25rem',
          }}>
            <CheckCircle2 style={{ width: '1.75rem', height: '1.75rem', color: '#34D399' }} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
            All clear! Zero platform alerts requiring immediate attention.
          </div>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0 }}>
            Every system service, queue, and tenant integration is performing normally.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {notifications.map((n) => (
            <div key={n.id} className="glass-card" style={{
              padding: '1.25rem',
              borderLeft: n.type === 'WARNING' ? '4px solid #F59E0B' : n.type === 'ERROR' ? '4px solid #EF4444' : '4px solid #3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>{n.title}</div>
                <div style={{ color: '#D1D5DB', fontSize: '0.85rem', marginTop: '0.25rem' }}>{n.message}</div>
              </div>
              <button
                onClick={() => router.push(n.actionUrl)}
                className="btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                View Action
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <Bell style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} /> SaaS Platform Notifications & Alerts
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            System-level notifications requiring platform administrative attention.
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
        <div style={{
          background: 'rgba(17, 24, 39, 0.8)',
          padding: '3.5rem 2rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(16, 185, 129, 0.25)',
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
            marginBottom: '0.5rem',
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
        <div style={{ display: 'grid', gap: '1rem' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{
              background: 'rgba(17, 24, 39, 0.8)',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              borderLeft: n.type === 'WARNING' ? '4px solid #F59E0B' : n.type === 'ERROR' ? '4px solid #EF4444' : '4px solid #3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>{n.title}</div>
                <div style={{ color: '#D1D5DB', fontSize: '0.9rem', marginTop: '0.25rem' }}>{n.message}</div>
              </div>
              <button
                onClick={() => router.push(n.actionUrl)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
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

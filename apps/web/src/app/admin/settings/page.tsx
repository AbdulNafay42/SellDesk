'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, RefreshCw, Save, ToggleLeft, ToggleRight, Shield, Sliders, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, fData] = await Promise.all([
        api.get<any[]>('/api/admin/settings'),
        api.get<any[]>('/api/admin/feature-flags'),
      ]);
      setSettings(Array.isArray(sData) ? sData : []);
      setFeatureFlags(Array.isArray(fData) ? fData : []);
      
      const valMap: { [key: string]: string } = {};
      if (Array.isArray(sData)) {
        sData.forEach((s) => {
          valMap[s.key] = s.value;
        });
      }
      setEditingValues(valMap);
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
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

  const handleSaveSetting = async (key: string) => {
    setSavingKey(key);
    try {
      await api.patch('/api/admin/settings', { key, value: editingValues[key] });
      await fetchData();
    } catch (err) {
      console.error('Failed to update setting:', err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleFlag = async (key: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/admin/feature-flags/${key}`, { isEnabled: !currentStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle feature flag:', err);
    }
  };

  return (
    <div style={{ color: '#F9FAFB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <Settings style={{ width: '2rem', height: '2rem', color: '#818CF8' }} /> Platform Configuration & Feature Flags
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Global platform environment settings and progressive feature flags. Secrets remain server-side.
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
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Config
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform configuration...</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Feature Flags Section */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#818CF8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders style={{ width: '1.25rem', height: '1.25rem' }} /> Platform Feature Flags (Progressive Rollout)
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {featureFlags.map((flag) => (
                <div key={flag.key} style={{
                  background: 'rgba(31, 41, 55, 0.5)',
                  padding: '1.25rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFF', fontSize: '1rem' }}>{flag.name}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.25rem' }}>{flag.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace', marginTop: '0.25rem' }}>Key: {flag.key}</div>
                  </div>
                  <button
                    onClick={() => handleToggleFlag(flag.key, flag.isEnabled)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: flag.isEnabled ? '#34D399' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {flag.isEnabled ? (
                      <>
                        <ToggleRight style={{ width: '2rem', height: '2rem' }} /> ENABLED
                      </>
                    ) : (
                      <>
                        <ToggleLeft style={{ width: '2rem', height: '2rem' }} /> DISABLED
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Settings Section */}
          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '1rem' }}>General System Settings</h2>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {settings.map((s) => (
                <div key={s.key} style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#818CF8', fontSize: '0.95rem' }}>{s.key}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{s.description} ({s.category})</div>
                    </div>
                    {s.isSecret && (
                      <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', fontWeight: 700 }}>
                        SECRET MASKED
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type={s.isSecret ? 'password' : 'text'}
                      value={editingValues[s.key] ?? s.value}
                      onChange={(e) => setEditingValues({ ...editingValues, [s.key]: e.target.value })}
                      disabled={s.isSecret}
                      style={{
                        flex: 1,
                        padding: '0.625rem 0.875rem',
                        borderRadius: '0.375rem',
                        background: 'rgba(17, 24, 39, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFF',
                        outline: 'none',
                        fontSize: '0.875rem',
                      }}
                    />
                    {!s.isSecret && (
                      <button
                        onClick={() => handleSaveSetting(s.key)}
                        disabled={savingKey === s.key}
                        style={{
                          padding: '0.625rem 1rem',
                          borderRadius: '0.375rem',
                          background: '#6366F1',
                          color: '#FFF',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <Save style={{ width: '0.875rem', height: '0.875rem' }} /> {savingKey === s.key ? 'Saving...' : 'Save'}
                      </button>
                    )}
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

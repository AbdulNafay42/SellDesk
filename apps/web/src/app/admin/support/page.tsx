'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LifeBuoy, RefreshCw, Search, MessageSquare, ShoppingBag, Package, Shield, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function AdminSupportInspectorPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<'conversations' | 'orders' | 'products'>('conversations');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = `/api/admin/support/${tab}?`;
      if (search) endpoint += `q=${encodeURIComponent(search)}`;
      const res = await api.get<any[]>(endpoint);
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(`Failed to fetch support ${tab}:`, err);
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
  }, [authLoading, user, tab]);

  return (
    <div style={{ color: '#F9FAFB' }}>
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF', lineHeight: 1.25 }}>
            <LifeBuoy style={{ width: '1.75rem', height: '1.75rem', color: '#EC4899', flexShrink: 0 }} /> Read-Only Support & Diagnostic Inspector
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
            Inspect brand metadata, customer messages, orders, and catalogs for troubleshooting. Operational mutations are strictly blocked.
          </p>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', color: '#F472B6', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
          <Lock style={{ width: '0.875rem', height: '0.875rem' }} /> Read-Only Enforcement Active
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('conversations')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: tab === 'conversations' ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
              color: tab === 'conversations' ? '#FFF' : '#9CA3AF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            <MessageSquare style={{ width: '0.875rem', height: '0.875rem' }} /> Conversations
          </button>
          <button
            onClick={() => setTab('orders')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: tab === 'orders' ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
              color: tab === 'orders' ? '#FFF' : '#9CA3AF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            <ShoppingBag style={{ width: '0.875rem', height: '0.875rem' }} /> Orders
          </button>
          <button
            onClick={() => setTab('products')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: tab === 'products' ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
              color: tab === 'products' ? '#FFF' : '#9CA3AF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Package style={{ width: '0.875rem', height: '0.875rem' }} /> Catalogs
          </button>
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#6B7280' }} />
          <input
            type="text"
            placeholder={`Search support ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.5rem',
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFF',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Inspector Table */}
      <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Inspecting merchant data...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No records found for support inspection.</div>
        ) : tab === 'conversations' ? (
          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Store Brand</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Channel</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Latest Message preview</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap' }}>{c.businessName}</td>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#E5E7EB' }}>{c.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{c.customerPhone}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#34D399', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.channel}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.recentMessages?.[0]?.text || 'No message content'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#F472B6', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'orders' ? (
          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Order #</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Store Brand</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Order Status</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#818CF8', whiteSpace: 'nowrap' }}>{o.orderNumber}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap' }}>{o.businessName}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#E5E7EB', whiteSpace: 'nowrap' }}>{o.customerName}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#34D399', fontWeight: 700, whiteSpace: 'nowrap' }}>Rs {(o.totalAmount ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#FBBF24', fontWeight: 600, whiteSpace: 'nowrap' }}>{o.status}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{o.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Product Name</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Store Brand</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Base Price</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Variants Count</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap' }}>{p.name}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#E5E7EB', whiteSpace: 'nowrap' }}>{p.businessName}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#34D399', fontWeight: 700, whiteSpace: 'nowrap' }}>Rs {(p.basePrice ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#818CF8', whiteSpace: 'nowrap' }}>{p.variantsCount} variant(s)</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{p.status}</td>
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

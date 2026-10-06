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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <LifeBuoy style={{ width: '2rem', height: '2rem', color: '#EC4899' }} /> Read-Only Support & Diagnostic Inspector
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Inspect brand metadata, customer messages, orders, and catalogs for troubleshooting. Operational mutations are strictly blocked.
          </p>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: '#F472B6', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Lock style={{ width: '0.875rem', height: '0.875rem' }} /> Read-Only Enforcement Active
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setTab('conversations')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: tab === 'conversations' ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
              color: tab === 'conversations' ? '#FFF' : '#9CA3AF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <MessageSquare style={{ width: '1rem', height: '1rem' }} /> Conversations
          </button>
          <button
            onClick={() => setTab('orders')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: tab === 'orders' ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
              color: tab === 'orders' ? '#FFF' : '#9CA3AF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShoppingBag style={{ width: '1rem', height: '1rem' }} /> Orders
          </button>
          <button
            onClick={() => setTab('products')}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: tab === 'products' ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
              color: tab === 'products' ? '#FFF' : '#9CA3AF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Package style={{ width: '1rem', height: '1rem' }} /> Catalogs
          </button>
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
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
      <div style={{ background: 'rgba(17, 24, 39, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Inspecting merchant data...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No records found for support inspection.</div>
        ) : tab === 'conversations' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(31, 41, 55, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                <th style={{ padding: '1rem' }}>Store Brand</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Channel</th>
                <th style={{ padding: '1rem' }}>Latest Message preview</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#FFF' }}>{c.businessName}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#E5E7EB' }}>{c.customerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{c.customerPhone}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#34D399', fontWeight: 600 }}>{c.channel}</td>
                  <td style={{ padding: '1rem', color: '#9CA3AF', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.recentMessages?.[0]?.text || 'No message content'}
                  </td>
                  <td style={{ padding: '1rem', color: '#F472B6', fontWeight: 600 }}>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === 'orders' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(31, 41, 55, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                <th style={{ padding: '1rem' }}>Order #</th>
                <th style={{ padding: '1rem' }}>Store Brand</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Total Amount</th>
                <th style={{ padding: '1rem' }}>Order Status</th>
                <th style={{ padding: '1rem' }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#818CF8' }}>{o.orderNumber}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#FFF' }}>{o.businessName}</td>
                  <td style={{ padding: '1rem', color: '#E5E7EB' }}>{o.customerName}</td>
                  <td style={{ padding: '1rem', color: '#34D399', fontWeight: 700 }}>Rs {(o.totalAmount ?? 0).toLocaleString()}</td>
                  <td style={{ padding: '1rem', color: '#FBBF24', fontWeight: 600 }}>{o.status}</td>
                  <td style={{ padding: '1rem', color: '#9CA3AF' }}>{o.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(31, 41, 55, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                <th style={{ padding: '1rem' }}>Product Name</th>
                <th style={{ padding: '1rem' }}>Store Brand</th>
                <th style={{ padding: '1rem' }}>Base Price</th>
                <th style={{ padding: '1rem' }}>Variants Count</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#FFF' }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: '#E5E7EB' }}>{p.businessName}</td>
                  <td style={{ padding: '1rem', color: '#34D399', fontWeight: 700 }}>Rs {(p.basePrice ?? 0).toLocaleString()}</td>
                  <td style={{ padding: '1rem', color: '#818CF8' }}>{p.variantsCount} variant(s)</td>
                  <td style={{ padding: '1rem', color: '#9CA3AF' }}>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

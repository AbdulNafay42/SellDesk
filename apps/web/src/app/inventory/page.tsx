'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Search,
  History,
  CheckCircle2,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Movement {
  id: string;
  sku: string;
  productName: string;
  variantInfo: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;
  timestamp: string;
}

interface VariantOption {
  id: string;
  sku: string;
  productName: string;
  size: string;
  color: string;
  stock: number;
  label: string;
}

interface LowStockAlert {
  sku: string;
  productName: string;
  variantInfo: string;
  stock: number;
  isAlertTriggered: boolean;
}

export default function InventoryPage() {
  const { activeBusinessId } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [lowStockAlert, setLowStockAlert] = useState<LowStockAlert | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('New shipment arrived');

  const loadInventoryData = async () => {
    if (!activeBusinessId) return;
    try {
      const [movRes, varRes, alertRes] = await Promise.all([
        api.get<Movement[]>('/api/inventory/movements').catch(() => []),
        api.get<VariantOption[]>('/api/inventory/variants').catch(() => []),
        api.get<LowStockAlert | null>('/api/inventory/low-stock').catch(() => null),
      ]);

      setMovements(Array.isArray(movRes) ? movRes : []);

      const varList = Array.isArray(varRes) ? varRes : [];
      setVariants(varList);
      if (varList.length > 0 && !sku) {
        setSku(varList[0].sku);
      }

      setLowStockAlert(alertRes);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [activeBusinessId]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku) return;
    try {
      await api.post<Movement>('/api/inventory/movements', {
        sku,
        quantity: Number(quantity),
        type: 'INBOUND_RESTOCK',
        notes,
      });
      await loadInventoryData();
    } catch (err) {
      console.error('Failed to record stock movement:', err);
    }
    setIsModalOpen(false);
  };

  const filteredMovements = movements.filter(
    (m) =>
      (m.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.reference || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Boxes style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              Dynamic Inventory Sync & Audit Log
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Real-time stock decrement on order confirmation, low-stock warnings, and restock tracking.
            </p>
          </div>

          <button
            onClick={() => {
              if (variants.length > 0 && !sku) setSku(variants[0].sku);
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
            Restock Inventory
          </button>
        </div>

        {/* Dynamic Low Stock Warning Banner */}
        {lowStockAlert && (
          <div
            style={{
              background: lowStockAlert.isAlertTriggered ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.1)',
              border: lowStockAlert.isAlertTriggered ? '0.0625rem solid rgba(244, 63, 94, 0.3)' : '0.0625rem solid rgba(16, 185, 129, 0.2)',
              padding: '1rem 1.25rem',
              borderRadius: '0.875rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle style={{ width: '1.375rem', height: '1.375rem', color: lowStockAlert.isAlertTriggered ? '#F43F5E' : '#34D399' }} />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
                  {lowStockAlert.isAlertTriggered ? 'Low Stock Alert Triggered' : 'Inventory Stock Status'}
                </div>
                <div style={{ fontSize: '0.8rem', color: lowStockAlert.isAlertTriggered ? '#FDA4AF' : '#D1D5DB' }}>
                  {lowStockAlert.isAlertTriggered ? (
                    <>
                      Variant <strong>{lowStockAlert.productName} ({lowStockAlert.sku})</strong> has only <strong>{lowStockAlert.stock} units</strong> remaining!
                    </>
                  ) : (
                    <>
                      Lowest stock item: <strong>{lowStockAlert.productName} ({lowStockAlert.sku})</strong> with <strong>{lowStockAlert.stock} units</strong> available.
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSku(lowStockAlert.sku);
                setIsModalOpen(true);
              }}
              className="btn-primary"
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8rem',
                background: lowStockAlert.isAlertTriggered ? '#F43F5E' : '#10B981',
              }}
            >
              Restock Now
            </button>
          </div>
        )}

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search movement by SKU, Product Name, or Order reference..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Movement Audit Trail Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem' }}>
            <History style={{ width: '1.125rem', height: '1.125rem', color: '#10B981' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>Inventory Audit Movement Logs</h2>
          </div>

          <div className="table-responsive-container">
            {filteredMovements.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                <Boxes style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem auto', color: '#4B5563' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>0 Stock Movements</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  No inventory movements recorded yet.
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '40rem' }}>
                <thead>
                  <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>SKU & Variant</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Movement Type</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Quantity</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Stock Adjustment</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Reference</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((mov) => (
                    <tr key={mov.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <div style={{ fontWeight: 800, color: '#34D399' }}>{mov.sku}</div>
                        <div style={{ fontSize: '0.78rem', color: '#FFF' }}>{mov.productName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{mov.variantInfo}</div>
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <span className={mov.quantity > 0 ? 'badge badge-success' : 'badge badge-rose'}>
                          {mov.type}
                        </span>
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 800, color: mov.quantity > 0 ? '#34D399' : '#F43F5E' }}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem', color: '#D1D5DB' }}>
                        {mov.previousStock} ➔ <strong style={{ color: '#FFF' }}>{mov.newStock} units</strong>
                      </td>

                      <td style={{ padding: '0.875rem 0.5rem', color: '#9CA3AF' }}>{mov.reference}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: '#6B7280', fontSize: '0.78rem' }}>{mov.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Restock Inventory Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(0.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1.25rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '31.25rem', padding: '1.75rem', background: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>Restock Inventory Variant</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleRestock} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Select SKU Variant</label>
                  {variants.length > 0 ? (
                    <select
                      className="input-glass"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    >
                      {variants.map((v) => (
                        <option key={v.id} value={v.sku}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. SHRT-LIN-001-M"
                      className="input-glass"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Add Stock Quantity</label>
                  <input type="number" required min={1} className="input-glass" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Restock Reference / Notes</label>
                  <input type="text" placeholder="e.g. Supplier Shipment #SS-490" className="input-glass" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Confirm Restock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

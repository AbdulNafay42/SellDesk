'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  Search,
  Layers,
  History,
  CheckCircle2,
  X,
} from 'lucide-react';

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

const initialMovements: Movement[] = [
  {
    id: 'mov-1',
    sku: 'HD-BLK-XL',
    productName: 'Oversized Black Premium Hoodie',
    variantInfo: 'Size: XL • Color: Black',
    type: 'OUTBOUND_ORDER',
    quantity: -2,
    previousStock: 5,
    newStock: 3,
    reference: 'Order #ORD-1042',
    timestamp: '10 mins ago',
  },
  {
    id: 'mov-2',
    sku: 'JKT-VNT-M',
    productName: 'Vintage Wash Denim Jacket',
    variantInfo: 'Size: M • Color: Blue Wash',
    type: 'INBOUND_RESTOCK',
    quantity: 10,
    previousStock: 0,
    newStock: 10,
    reference: 'Supplier Restock #SS-489',
    timestamp: 'Yesterday',
  },
  {
    id: 'mov-3',
    sku: 'TS-WHT-S',
    productName: 'Minimalist Essential White Tee',
    variantInfo: 'Size: S • Color: White',
    type: 'OUTBOUND_ORDER',
    quantity: -1,
    previousStock: 41,
    newStock: 40,
    reference: 'Order #ORD-1038',
    timestamp: '2 days ago',
  },
];

export default function InventoryPage() {
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [sku, setSku] = useState('HD-BLK-XL');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('New shipment arrived');

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      sku,
      productName: 'Oversized Black Premium Hoodie',
      variantInfo: 'Size: XL • Color: Black',
      type: 'INBOUND_RESTOCK',
      quantity: Number(quantity),
      previousStock: 3,
      newStock: 3 + Number(quantity),
      reference: notes || 'Manual Restock',
      timestamp: 'Just now',
    };

    setMovements([newMov, ...movements]);
    setIsModalOpen(false);
  };

  const filteredMovements = movements.filter(
    (m) =>
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <Header />

      <main style={{ marginLeft: '260px', marginTop: '70px', flex: 1, padding: '32px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Boxes style={{ width: '24px', height: '24px', color: '#10B981' }} />
              Dynamic Inventory Sync & Audit Log
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '4px' }}>
              Real-time stock decrement on order confirmation, low-stock warnings, and restock tracking.
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '18px', height: '18px' }} />
            Restock Inventory
          </button>
        </div>

        {/* Low Stock Warning Banner */}
        <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '16px 20px', borderRadius: '14px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle style={{ width: '22px', height: '22px', color: '#F43F5E' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>Low Stock Alert Triggered</div>
              <div style={{ fontSize: '0.8rem', color: '#FDA4AF' }}>Variant <strong>Oversized Black Hoodie (XL)</strong> has only 3 units remaining!</div>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#F43F5E' }}>
            Restock Now
          </button>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search movement by SKU, Product Name, or Order reference..."
              className="input-glass"
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Movement Audit Trail Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <History style={{ width: '18px', height: '18px', color: '#10B981' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>Inventory Audit Movement Logs</h2>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 8px' }}>SKU & Variant</th>
                <th style={{ padding: '12px 8px' }}>Movement Type</th>
                <th style={{ padding: '12px 8px' }}>Quantity</th>
                <th style={{ padding: '12px 8px' }}>Stock Adjustment</th>
                <th style={{ padding: '12px 8px' }}>Reference</th>
                <th style={{ padding: '12px 8px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((mov) => (
                <tr key={mov.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ fontWeight: 800, color: '#34D399' }}>{mov.sku}</div>
                    <div style={{ fontSize: '0.78rem', color: '#FFF' }}>{mov.productName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{mov.variantInfo}</div>
                  </td>

                  <td style={{ padding: '14px 8px' }}>
                    <span className={mov.quantity > 0 ? 'badge badge-success' : 'badge badge-rose'}>
                      {mov.type}
                    </span>
                  </td>

                  <td style={{ padding: '14px 8px', fontWeight: 800, color: mov.quantity > 0 ? '#34D399' : '#F43F5E' }}>
                    {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                  </td>

                  <td style={{ padding: '14px 8px', color: '#D1D5DB' }}>
                    {mov.previousStock} ➔ <strong style={{ color: '#FFF' }}>{mov.newStock} units</strong>
                  </td>

                  <td style={{ padding: '14px 8px', color: '#9CA3AF' }}>{mov.reference}</td>
                  <td style={{ padding: '14px 8px', color: '#6B7280', fontSize: '0.78rem' }}>{mov.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Restock Inventory Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', background: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>Restock Inventory Variant</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <form onSubmit={handleRestock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Select SKU Variant</label>
                  <select className="input-glass" value={sku} onChange={(e) => setSku(e.target.value)}>
                    <option value="HD-BLK-XL">HD-BLK-XL (Black Hoodie XL - 3 units left)</option>
                    <option value="JKT-VNT-M">JKT-VNT-M (Denim Jacket M - 10 units)</option>
                    <option value="TS-WHT-S">TS-WHT-S (White Tee S - 40 units)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Add Stock Quantity</label>
                  <input type="number" required min={1} className="input-glass" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Restock Reference / Notes</label>
                  <input type="text" placeholder="e.g. Supplier Shipment #SS-490" className="input-glass" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px' }} /> Confirm Restock
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

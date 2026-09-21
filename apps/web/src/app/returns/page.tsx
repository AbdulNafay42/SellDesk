'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  RotateCcw,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Search,
  PackageCheck,
  ShoppingBag,
  RefreshCw,
  Tag,
} from 'lucide-react';

interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  sku: string;
  quantity: number;
  returnReason: 'SIZE_MISMATCH' | 'WRONG_ITEM_SENT' | 'DEFECTIVE' | 'COD_REFUSED';
  status: 'RETURN_REQUESTED' | 'APPROVED' | 'RECEIVED_IN_WAREHOUSE' | 'RESTOCKED' | 'REFUNDED';
  requestDate: string;
  restocked: boolean;
}

const initialReturns: ReturnRequest[] = [
  {
    id: 'ret-101',
    returnNumber: 'RET-8801',
    orderNumber: 'ORD-1077',
    customerName: 'Zubair Raza',
    customerPhone: '0333-2211443',
    productName: 'Oversized Black Premium Hoodie (L)',
    sku: 'HOOD-BLK-L',
    quantity: 1,
    returnReason: 'SIZE_MISMATCH',
    status: 'RECEIVED_IN_WAREHOUSE',
    requestDate: '2026-09-19 11:20',
    restocked: false,
  },
  {
    id: 'ret-102',
    returnNumber: 'RET-8802',
    orderNumber: 'ORD-1065',
    customerName: 'Kashif Ali',
    customerPhone: '0321-9988776',
    productName: 'Vintage Wash Denim Jacket (M)',
    sku: 'JCKT-DEN-M',
    quantity: 1,
    returnReason: 'COD_REFUSED',
    status: 'RESTOCKED',
    requestDate: '2026-09-18 16:40',
    restocked: true,
  },
  {
    id: 'ret-103',
    returnNumber: 'RET-8803',
    orderNumber: 'ORD-1085',
    customerName: 'Mariam Sohail',
    customerPhone: '0315-4433221',
    productName: 'Minimalist Essential White Tee (S)',
    sku: 'TEE-WHT-S',
    quantity: 2,
    returnReason: 'WRONG_ITEM_SENT',
    status: 'RETURN_REQUESTED',
    requestDate: '2026-09-21 15:30',
    restocked: false,
  },
];

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(initialReturns);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleRestock = (id: string) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'RESTOCKED', restocked: true } : r))
    );
  };

  const filteredReturns = returns.filter(
    (r) =>
      r.returnNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase())
  );

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'SIZE_MISMATCH':
        return <span className="badge badge-warning">Size Mismatch</span>;
      case 'COD_REFUSED':
        return <span className="badge badge-rose">COD Delivery Refused</span>;
      case 'WRONG_ITEM_SENT':
        return <span className="badge badge-indigo">Wrong Item Dispatched</span>;
      default:
        return <span className="badge badge-rose">Defective / Damaged</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESTOCKED':
        return <span className="badge badge-success"><PackageCheck style={{ width: '0.75rem', height: '0.75rem' }} /> Restocked in Inventory</span>;
      case 'RECEIVED_IN_WAREHOUSE':
        return <span className="badge badge-indigo"><Boxes style={{ width: '0.75rem', height: '0.75rem' }} /> Received at Warehouse</span>;
      case 'RETURN_REQUESTED':
        return <span className="badge badge-warning"><RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} /> Pending Approval</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
              Reverse Logistics & Return Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Process size exchanges, customer returns, COD refusal RTOs, and auto-restock items to inventory.
            </p>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Active Return Requests</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>
              {returns.filter((r) => r.status !== 'RESTOCKED').length} Items
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Restocked to Inventory</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>
              {returns.filter((r) => r.restocked).length} Restocked
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search returns by RET#, Order #, customer, or product..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Returns Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Return # & Order</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Product Item</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Return Reason</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#FFF', fontFamily: 'monospace' }}>{ret.returnNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{ret.orderNumber}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{ret.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{ret.customerPhone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <ShoppingBag style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} /> {ret.productName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>SKU: {ret.sku} (Qty: {ret.quantity})</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{getReasonBadge(ret.returnReason)}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(ret.status)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {!ret.restocked ? (
                        <button
                          onClick={() => handleRestock(ret.id)}
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        >
                          <Boxes style={{ width: '0.875rem', height: '0.875rem' }} /> 1-Click Restock
                        </button>
                      ) : (
                        <span className="badge badge-success" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                          <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} /> Restocked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

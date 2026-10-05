'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
  Plus,
  X,
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



export default function ReturnsPage() {
  const { activeBusinessId } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchReturns = async () => {
      if (!activeBusinessId) return;
      try {
        const data = await api.get<ReturnRequest[]>('/api/returns');
        if (isMounted) setReturns(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load returns:', err);
      }
    };
    fetchReturns();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRestock = async (id: string) => {
    if (restockingId) return;
    setRestockingId(id);
    setErrorMsg(null);

    try {
      const updated = await api.post<ReturnRequest>(`/api/returns/${id}/restock`);
      setReturns((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated, status: 'RESTOCKED', restocked: true } : r))
      );
    } catch (err: any) {
      console.error('Failed to restock return:', err);
      setErrorMsg(err?.message || 'Failed to restock return item. Please try again.');
    } finally {
      setRestockingId(null);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [returnReason, setReturnReason] = useState('SIZE_MISMATCH');

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !customerName) return;

    try {
      const created = await api.post<ReturnRequest>('/api/returns', {
        orderNumber,
        customerName,
        customerPhone,
        productName: productName || 'Oversized Hoodie',
        sku: sku || 'SKU-HD-BLK-XL',
        returnReason,
      });

      if (created) {
        setReturns((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create return request:', err);
    }

    setIsModalOpen(false);
    setOrderNumber('');
    setCustomerName('');
    setCustomerPhone('');
    setProductName('');
    setSku('');
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

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
            Log Return Request
          </button>
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

        {/* Error Banner */}
        {errorMsg && (
          <div style={{ color: '#EF4444', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Returns Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive-container">
            {filteredReturns.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                <RotateCcw style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem auto', color: '#4B5563' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>0 Return Requests</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>No reverse logistics or return requests found for this business.</div>
              </div>
            ) : (
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
                          disabled={restockingId === ret.id}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        >
                          <Boxes style={{ width: '0.875rem', height: '0.875rem' }} /> {restockingId === ret.id ? 'Restocking...' : '1-Click Restock'}
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
            )}
          </div>
        </div>

        {/* Log Return Request Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(0.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1.25rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '31.25rem', padding: '1.75rem', background: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>Log Return / Reverse Logistics Request</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleCreateReturn} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Order Number</label>
                  <input type="text" required placeholder="e.g. #ORD-8078" className="input-glass" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Customer Name</label>
                    <input type="text" required placeholder="e.g. Abdul Nafay" className="input-glass" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Customer Phone</label>
                    <input type="text" placeholder="03313780919" className="input-glass" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Product Name</label>
                    <input type="text" placeholder="e.g. Oversized Black Hoodie" className="input-glass" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Product SKU</label>
                    <input type="text" placeholder="HD-BLK-XL" className="input-glass" value={sku} onChange={(e) => setSku(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Return Reason</label>
                  <select className="input-glass" value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                    <option value="SIZE_MISMATCH">Size Mismatch / Exchange</option>
                    <option value="COD_REFUSED">COD Delivery Refused by Customer (RTO)</option>
                    <option value="WRONG_ITEM_SENT">Wrong Item Dispatched</option>
                    <option value="DEFECTIVE">Defective / Damaged Goods</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Save Return Request
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

'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Eye,
  FileCheck,
  Building2,
  PhoneCall,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'RAAST';
  amountPKR: number;
  status: 'PAID' | 'PENDING_VERIFICATION' | 'REFUNDED';
  trxId?: string;
  date: string;
  notes?: string;
}

const initialPayments: PaymentRecord[] = [
  {
    id: 'pay-101',
    orderNumber: 'ORD-1089',
    customerName: 'Hamza Tariq',
    customerPhone: '0312-7788990',
    paymentMethod: 'COD',
    amountPKR: 3500,
    status: 'PAID',
    date: '2026-09-21 14:30',
    notes: 'Collected by Courier on Delivery',
  },
  {
    id: 'pay-102',
    orderNumber: 'ORD-1090',
    customerName: 'Sana Malik',
    customerPhone: '0301-4455667',
    paymentMethod: 'BANK_TRANSFER',
    amountPKR: 4500,
    status: 'PENDING_VERIFICATION',
    trxId: 'MEEZAN-998822',
    date: '2026-09-21 15:10',
    notes: 'Customer uploaded online mobile banking receipt screenshot',
  },
  {
    id: 'pay-103',
    orderNumber: 'ORD-1091',
    customerName: 'Bilal Ahmed',
    customerPhone: '0346-1122334',
    paymentMethod: 'JAZZCASH',
    amountPKR: 2900,
    status: 'PAID',
    trxId: 'JC-88220199',
    date: '2026-09-21 12:15',
    notes: 'Instant wallet transfer verified',
  },
  {
    id: 'pay-104',
    orderNumber: 'ORD-1092',
    customerName: 'Ayesha Khan',
    customerPhone: '0300-9988776',
    paymentMethod: 'EASYPAISA',
    amountPKR: 1450,
    status: 'PENDING_VERIFICATION',
    trxId: 'EP-4455110',
    date: '2026-09-21 16:05',
    notes: 'Pending manual banking check',
  },
  {
    id: 'pay-105',
    orderNumber: 'ORD-1082',
    customerName: 'Zubair Raza',
    customerPhone: '0333-2211443',
    paymentMethod: 'COD',
    amountPKR: 3500,
    status: 'REFUNDED',
    date: '2026-09-20 11:20',
    notes: 'Size exchange refund processed via Raast',
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_VERIFICATION' | 'PAID' | 'REFUNDED'>('ALL');
  const [search, setSearch] = useState('');
  
  // Verification Modal state
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [trxInput, setTrxInput] = useState('');

  const handleVerify = () => {
    if (!selectedPayment) return;
    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id
          ? { ...p, status: 'PAID', trxId: trxInput || p.trxId || 'MANUAL-VERIFIED', notes: 'Verified manually by Seller' }
          : p
      )
    );
    setSelectedPayment(null);
    setTrxInput('');
  };

  const filteredPayments = payments.filter((p) => {
    const matchesTab = activeTab === 'ALL' || p.status === activeTab;
    const matchesSearch =
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerPhone.includes(search) ||
      (p.trxId && p.trxId.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'COD':
        return <span className="badge badge-indigo">COD (Cash on Delivery)</span>;
      case 'BANK_TRANSFER':
        return <span className="badge badge-success">Bank Transfer</span>;
      case 'JAZZCASH':
        return <span className="badge badge-warning">JazzCash</span>;
      case 'EASYPAISA':
        return <span className="badge badge-success">EasyPaisa</span>;
      case 'RAAST':
        return <span className="badge badge-indigo">Raast Instant</span>;
      default:
        return <span className="badge">{method}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Settlement Paid
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> Pending Check
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} /> Refunded
          </span>
        );
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
              <CreditCard style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              Payment Ledger & Settlement Engine
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Reconcile Cash on Delivery (COD) courier payouts & verify digital online banking transfers.
            </p>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Settled Payments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>
              Rs {payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amountPKR, 0).toLocaleString()}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Pending Verification</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>
              Rs {payments.filter((p) => p.status === 'PENDING_VERIFICATION').reduce((sum, p) => sum + p.amountPKR, 0).toLocaleString()}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Refunds Processed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDA4AF', marginTop: '0.25rem' }}>
              Rs {payments.filter((p) => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amountPKR, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.375rem', borderRadius: '0.625rem' }}>
            {(['ALL', 'PENDING_VERIFICATION', 'PAID', 'REFUNDED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#10B981' : 'transparent',
                  color: activeTab === tab ? '#FFF' : '#9CA3AF',
                  border: 'none',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab === 'PENDING_VERIFICATION' ? 'Pending Check' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '18rem' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search by order #, customer, TRX..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order & Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount (PKR)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>TRX Ref ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{pay.orderNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{pay.customerName} ({pay.customerPhone})</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{getMethodBadge(pay.paymentMethod)}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#34D399' }}>
                      Rs {pay.amountPKR.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', color: pay.trxId ? '#A5B4FC' : '#6B7280', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {pay.trxId || 'N/A (COD)'}
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(pay.status)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {pay.status === 'PENDING_VERIFICATION' ? (
                        <button
                          onClick={() => {
                            setSelectedPayment(pay);
                            setTrxInput(pay.trxId || '');
                          }}
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        >
                          <FileCheck style={{ width: '0.875rem', height: '0.875rem' }} /> Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPayment(pay);
                            setTrxInput(pay.trxId || '');
                          }}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        >
                          <Eye style={{ width: '0.875rem', height: '0.875rem' }} /> Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification / Details Modal */}
        {selectedPayment && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(0.5rem)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '28rem', padding: '1.75rem', backgroundColor: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                  Payment Details #{selectedPayment.orderNumber}
                </h3>
                <button onClick={() => setSelectedPayment(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Customer:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{selectedPayment.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Amount:</span>
                  <span style={{ color: '#34D399', fontWeight: 800 }}>Rs {selectedPayment.amountPKR.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Payment Method:</span>
                  <span>{getMethodBadge(selectedPayment.paymentMethod)}</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>
                    Bank/Wallet TRX Reference ID
                  </label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Enter Transaction Reference ID (e.g. MEEZAN-992211)"
                    value={trxInput}
                    onChange={(e) => setTrxInput(e.target.value)}
                  />
                </div>

                {selectedPayment.notes && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#D1D5DB' }}>
                    <strong>Note:</strong> {selectedPayment.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedPayment(null)} className="btn-secondary">
                  Close
                </button>
                {selectedPayment.status === 'PENDING_VERIFICATION' && (
                  <button onClick={handleVerify} className="btn-primary">
                    <Check style={{ width: '1rem', height: '1rem' }} /> Mark Verified & Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

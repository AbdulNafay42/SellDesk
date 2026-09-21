'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  ShoppingBag,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  XCircle,
  RotateCcw,
  X,
  MapPin,
  Phone,
  User,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  productName: string;
  variantInfo: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

const initialOrders: Order[] = [
  {
    id: 'ord-1042',
    orderNumber: '#ORD-1042',
    customerName: 'Ahmed Khan',
    customerPhone: '0300-4829102',
    city: 'Lahore',
    address: 'House #42, Block C, Model Town',
    productName: 'Oversized Black Premium Hoodie',
    variantInfo: 'Size: XL • Color: Black',
    quantity: 1,
    totalAmount: 4749,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'NEW',
    createdAt: '10 mins ago',
  },
  {
    id: 'ord-1041',
    orderNumber: '#ORD-1041',
    customerName: 'Fatima Zohra',
    customerPhone: '0321-9920144',
    city: 'Karachi',
    address: 'Flat 402, Sunset Boulevard, DHA Phase 5',
    productName: 'Vintage Wash Denim Jacket',
    variantInfo: 'Size: M • Color: Blue Wash',
    quantity: 1,
    totalAmount: 6200,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'CONFIRMED',
    createdAt: '2 hours ago',
  },
  {
    id: 'ord-1040',
    orderNumber: '#ORD-1040',
    customerName: 'Usman Ali',
    customerPhone: '0333-1029384',
    city: 'Islamabad',
    address: 'Street 14, Sector F-8/3',
    productName: 'Minimalist Essential White Tee',
    variantInfo: 'Size: L • Color: White',
    quantity: 2,
    totalAmount: 4198,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'PAID',
    status: 'PACKED',
    createdAt: 'Yesterday',
  },
  {
    id: 'ord-1039',
    orderNumber: '#ORD-1039',
    customerName: 'Zainab Bibi',
    customerPhone: '0345-5544332',
    city: 'Faisalabad',
    address: 'Civil Lines Road',
    productName: 'Oversized Black Premium Hoodie',
    variantInfo: 'Size: M • Color: Black',
    quantity: 1,
    totalAmount: 4749,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'SHIPPED',
    createdAt: '2 days ago',
  },
];

const statusFlow = ['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [productName, setProductName] = useState('Oversized Black Premium Hoodie');
  const [variantInfo, setVariantInfo] = useState('Size: XL • Color: Black');
  const [totalAmount, setTotalAmount] = useState(4499);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const handleStatusChange = (id: string, nextStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      city,
      address,
      productName,
      variantInfo,
      quantity: 1,
      totalAmount: totalAmount + 250,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      status: 'NEW',
      createdAt: 'Just now',
    };

    setOrders([newOrd, ...orders]);
    setIsModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'ALL' || o.status === activeTab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'badge-indigo';
      case 'CONFIRMED':
        return 'badge-success';
      case 'PROCESSING':
      case 'PACKED':
        return 'badge-warning';
      case 'SHIPPED':
      case 'DELIVERED':
        return 'badge-success';
      default:
        return 'badge-rose';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <Header />

      <main style={{ marginLeft: '260px', marginTop: '70px', flex: 1, padding: '32px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Order Management Engine</h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '4px' }}>
              Track customer order statuses, COD totals, shipping addresses and Pakistani courier workflows.
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '18px', height: '18px' }} />
            Create Manual Order
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
          {['ALL', 'NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab ? '#34D399' : '#9CA3AF',
                border: activeTab === tab ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Filter by Order #, Customer Name, or Phone..."
              className="input-glass"
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 10px' }}>Order #</th>
                <th style={{ padding: '12px 10px' }}>Customer & Shipping</th>
                <th style={{ padding: '12px 10px' }}>Product & Variant</th>
                <th style={{ padding: '12px 10px' }}>Payment</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
                <th style={{ padding: '12px 10px' }}>Action Workflow</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 800, color: '#34D399', fontSize: '0.95rem' }}>{ord.orderNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '4px' }}>{ord.createdAt}</div>
                  </td>

                  <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, color: '#FFF' }}>{ord.customerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone style={{ width: '12px', height: '12px' }} /> {ord.customerPhone}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin style={{ width: '12px', height: '12px' }} /> {ord.city} — {ord.address}
                    </div>
                  </td>

                  <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: '#E5E7EB' }}>{ord.productName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '2px' }}>{ord.variantInfo}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>Qty: {ord.quantity}</div>
                  </td>

                  <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 800, color: '#FFF', fontSize: '1rem' }}>Rs {ord.totalAmount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, marginTop: '2px' }}>{ord.paymentMethod}</div>
                  </td>

                  <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                    <span className={`badge ${getStatusBadge(ord.status)}`}>{ord.status}</span>
                  </td>

                  <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {ord.status === 'NEW' && (
                        <button onClick={() => handleStatusChange(ord.id, 'CONFIRMED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Confirm
                        </button>
                      )}
                      {ord.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusChange(ord.id, 'PACKED')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#FBBF24' }}>
                          <PackageCheck style={{ width: '12px', height: '12px' }} /> Pack Order
                        </button>
                      )}
                      {ord.status === 'PACKED' && (
                        <button onClick={() => handleStatusChange(ord.id, 'SHIPPED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          <Truck style={{ width: '12px', height: '12px' }} /> Ship Courier
                        </button>
                      )}
                      {ord.status === 'SHIPPED' && (
                        <button onClick={() => handleStatusChange(ord.id, 'DELIVERED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Mark Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Manual Order Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '28px', background: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>Create Manual Order</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Customer Name</label>
                    <input type="text" required placeholder="Ahmed Khan" className="input-glass" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                    <input type="text" required placeholder="0300-1234567" className="input-glass" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>City</label>
                    <input type="text" required className="input-glass" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Delivery Address</label>
                    <input type="text" required placeholder="House #, Street, Area..." className="input-glass" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Product Item</label>
                  <select className="input-glass" value={productName} onChange={(e) => setProductName(e.target.value)}>
                    <option value="Oversized Black Premium Hoodie">Oversized Black Premium Hoodie (Rs 4,499)</option>
                    <option value="Vintage Wash Denim Jacket">Vintage Wash Denim Jacket (Rs 6,200)</option>
                    <option value="Minimalist Essential White Tee">Minimalist Essential White Tee (Rs 1,999)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Variant (Size / Color)</label>
                    <input type="text" className="input-glass" value={variantInfo} onChange={(e) => setVariantInfo(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>Payment Method</label>
                    <select className="input-glass" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Confirm & Save Order
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

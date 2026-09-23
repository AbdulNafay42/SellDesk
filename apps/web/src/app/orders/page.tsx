'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  PackageCheck,
  Truck,
  X,
  MapPin,
  Phone,
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

import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const { activeBusinessId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New Order Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [productName, setProductName] = useState('Oversized Black Premium Hoodie');
  const [variantInfo, setVariantInfo] = useState('Size: XL • Color: Black');
  const [totalAmount, setTotalAmount] = useState(4499);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      if (!activeBusinessId) return;
      try {
        const data = await api.get<Order[]>('/api/orders');
        if (isMounted) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadOrders();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

  const handleStatusChange = async (id: string, nextStatus: string) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status: nextStatus }).catch(() => null);
    } catch { }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    try {
      const created = await api.post<Order>('/api/orders', {
        customerName,
        customerPhone,
        city,
        address,
        productName,
        variantInfo,
        quantity: 1,
        totalAmount,
        paymentMethod,
      });

      if (created) {
        setOrders([created, ...orders]);
      }
    } catch {
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
    }
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
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Order Management Engine</h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Track customer order statuses, COD totals, shipping addresses and Pakistani courier workflows.
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
            Create Manual Order
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {['ALL', 'NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab ? '#34D399' : '#9CA3AF',
                border: activeTab === tab ? '0.0625rem solid rgba(16, 185, 129, 0.4)' : '0.0625rem solid rgba(255, 255, 255, 0.08)',
                padding: '0.375rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Filter by Order #, Customer Name, or Phone..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table Card with Mobile Scroll Wrapper */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive-container">
            {filteredOrders.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                <ShoppingBag style={{ width: '3rem', height: '3rem', margin: '0 auto 0.875rem auto', color: '#4B5563' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>0 Orders</div>
                <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  No orders found for this business. Click &ldquo;Create Manual Order&rdquo; to add one.
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '40rem' }}>
                <thead>
                  <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.625rem' }}>Order #</th>
                    <th style={{ padding: '0.75rem 0.625rem' }}>Customer & Shipping</th>
                    <th style={{ padding: '0.75rem 0.625rem' }}>Product & Variant</th>
                    <th style={{ padding: '0.75rem 0.625rem' }}>Payment</th>
                    <th style={{ padding: '0.75rem 0.625rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.625rem' }}>Action Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '1rem 0.625rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 800, color: '#34D399', fontSize: '0.95rem' }}>{ord.orderNumber}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.25rem' }}>{ord.createdAt}</div>
                      </td>

                      <td style={{ padding: '1rem 0.625rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#FFF' }}>{ord.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                          <Phone style={{ width: '0.75rem', height: '0.75rem' }} /> {ord.customerPhone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                          <MapPin style={{ width: '0.75rem', height: '0.75rem' }} /> {ord.city} — {ord.address}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 0.625rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: '#E5E7EB' }}>{ord.productName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.125rem' }}>{ord.variantInfo}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.125rem' }}>Qty: {ord.quantity}</div>
                      </td>

                      <td style={{ padding: '1rem 0.625rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 800, color: '#FFF', fontSize: '1rem' }}>Rs {ord.totalAmount.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, marginTop: '0.125rem' }}>{ord.paymentMethod}</div>
                      </td>

                      <td style={{ padding: '1rem 0.625rem', verticalAlign: 'top' }}>
                        <span className={`badge ${getStatusBadge(ord.status)}`}>{ord.status}</span>
                      </td>

                      <td style={{ padding: '1rem 0.625rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {ord.status === 'NEW' && (
                            <button onClick={() => handleStatusChange(ord.id, 'CONFIRMED')} className="btn-primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                              <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Confirm
                            </button>
                          )}
                          {ord.status === 'CONFIRMED' && (
                            <button onClick={() => handleStatusChange(ord.id, 'PACKED')} className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', color: '#FBBF24' }}>
                              <PackageCheck style={{ width: '0.75rem', height: '0.75rem' }} /> Pack Order
                            </button>
                          )}
                          {ord.status === 'PACKED' && (
                            <button onClick={() => handleStatusChange(ord.id, 'SHIPPED')} className="btn-primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                              <Truck style={{ width: '0.75rem', height: '0.75rem' }} /> Ship Courier
                            </button>
                          )}
                          {ord.status === 'SHIPPED' && (
                            <button onClick={() => handleStatusChange(ord.id, 'DELIVERED')} className="btn-primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                              <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Mark Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Manual Order Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(0.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1.25rem',
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '37.5rem', padding: '1.75rem', background: '#111827', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>Create Manual Order</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Customer Name</label>
                    <input type="text" required placeholder="Ahmed Khan" className="input-glass" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label>
                    <input type="text" required placeholder="0300-1234567" className="input-glass" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>City</label>
                    <input type="text" required className="input-glass" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Delivery Address</label>
                    <input type="text" required placeholder="House #, Street, Area..." className="input-glass" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Product Item</label>
                  <select className="input-glass" value={productName} onChange={(e) => setProductName(e.target.value)}>
                    <option value="Oversized Black Premium Hoodie">Oversized Black Premium Hoodie (Rs 4,499)</option>
                    <option value="Vintage Wash Denim Jacket">Vintage Wash Denim Jacket (Rs 6,200)</option>
                    <option value="Minimalist Essential White Tee">Minimalist Essential White Tee (Rs 1,999)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Variant (Size / Color)</label>
                    <input type="text" className="input-glass" value={variantInfo} onChange={(e) => setVariantInfo(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Payment Method</label>
                    <select className="input-glass" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
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

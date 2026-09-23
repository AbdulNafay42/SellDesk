'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  address: string;
  totalSpent: number;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  lastOrdered: string;
}

const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Ahmed Khan',
    phoneNumber: '0300-4829102',
    city: 'Lahore',
    address: 'House #42, Block C, Model Town',
    totalSpent: 24500,
    totalOrders: 7,
    deliveredOrders: 5,
    returnedOrders: 1,
    lastOrdered: 'Today',
  },
  {
    id: 'cust-2',
    fullName: 'Fatima Zohra',
    phoneNumber: '0321-9920144',
    city: 'Karachi',
    address: 'Flat 402, Sunset Boulevard, DHA Phase 5',
    totalSpent: 18600,
    totalOrders: 4,
    deliveredOrders: 4,
    returnedOrders: 0,
    lastOrdered: '2 hours ago',
  },
  {
    id: 'cust-3',
    fullName: 'Usman Ali',
    phoneNumber: '0333-1029384',
    city: 'Islamabad',
    address: 'Street 14, Sector F-8/3',
    totalSpent: 8900,
    totalOrders: 2,
    deliveredOrders: 2,
    returnedOrders: 0,
    lastOrdered: 'Yesterday',
  },
  {
    id: 'cust-4',
    fullName: 'Zainab Bibi',
    phoneNumber: '0345-5544332',
    city: 'Faisalabad',
    address: 'Civil Lines Road, Near Clock Tower',
    totalSpent: 14200,
    totalOrders: 3,
    deliveredOrders: 2,
    returnedOrders: 1,
    lastOrdered: '2 days ago',
  },
];

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CustomersPage() {
  const { activeBusinessId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCustomers = async () => {
      if (!activeBusinessId) return;
      try {
        const data = await api.get<Customer[]>('/api/customers');
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setCustomers(list);
          setSelectedCustomer(list[0] || null);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

  const filteredCustomers = customers.filter(
    (c) =>
      (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phoneNumber || '').includes(search) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Customer CRM Directory</h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Track customer repeat purchases, lifetime value (LTV) in PKR, and order delivery histories.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search customer by name, phone 03xx..., or city..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Main Grid: Directory & Customer Details Timeline */}
        {filteredCustomers.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
            <Users style={{ width: '3rem', height: '3rem', margin: '0 auto 0.875rem auto', color: '#4B5563' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>0 Customers</div>
            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
              No customer records found for this business.
            </div>
          </div>
        ) : (
          <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
          {/* Customer Cards List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))', gap: '1rem' }}>
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    borderColor: isSelected ? '#10B981' : undefined,
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>
                      {cust.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{cust.city}</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF', marginBottom: '0.25rem' }}>{cust.fullName}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <Phone style={{ width: '0.8125rem', height: '0.8125rem' }} /> {cust.phoneNumber}
                  </div>

                  <div style={{ borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ color: '#6B7280', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Spent</div>
                      <div style={{ fontWeight: 800, color: '#FFF' }}>Rs {cust.totalSpent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6B7280', fontSize: '0.7rem', textTransform: 'uppercase' }}>Orders</div>
                      <div style={{ fontWeight: 700, color: '#34D399' }}>{cust.totalOrders} total</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Profile & Timeline View */}
          {selectedCustomer && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: '#FFF' }}>
                  {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>{selectedCustomer.fullName}</h2>
                  <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{selectedCustomer.phoneNumber} • {selectedCustomer.city}</p>
                </div>
              </div>

              {/* Delivery & Return Ratio Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.875rem', borderRadius: '0.75rem', border: '0.0625rem solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Orders</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>{selectedCustomer.deliveredOrders}</div>
                </div>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.875rem', borderRadius: '0.75rem', border: '0.0625rem solid rgba(244, 63, 94, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#FDA4AF', fontWeight: 700, textTransform: 'uppercase' }}>Returns / Cancelled</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>{selectedCustomer.returnedOrders}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin style={{ width: '0.875rem', height: '0.875rem' }} /> Shipping Address
                </div>
                <div style={{ fontSize: '0.85rem', color: '#E5E7EB', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '0.625rem', border: '0.0625rem solid rgba(255, 255, 255, 0.06)' }}>
                  {selectedCustomer.address}, {selectedCustomer.city}
                </div>
              </div>

              {/* Customer Timeline Activity */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock style={{ width: '1rem', height: '1rem', color: '#10B981' }} /> Customer History Timeline
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '0.125rem solid rgba(255, 255, 255, 0.08)', paddingLeft: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.375rem', top: '0.125rem', width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#10B981' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFF' }}>Ordered Oversized Black Hoodie (XL)</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Amount: Rs 4,749 (COD) • {selectedCustomer.lastOrdered}</div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.375rem', top: '0.125rem', width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#6366F1' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFF' }}>Inquired via WhatsApp for XL Stock</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>AI Intent extracted: AVAILABILITY</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}

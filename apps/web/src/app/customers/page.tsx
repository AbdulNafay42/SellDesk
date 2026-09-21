'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
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

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomers[0]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <Header />

      <main style={{ marginLeft: '260px', marginTop: '70px', flex: 1, padding: '32px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Customer CRM Directory</h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '4px' }}>
              Track customer repeat purchases, lifetime value (LTV) in PKR, and order delivery histories.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search customer by name, phone 03xx..., or city..."
              className="input-glass"
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Main Grid: Directory & Customer Details Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
          {/* Customer Cards List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    borderColor: isSelected ? '#10B981' : undefined,
                    background: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>
                      {cust.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{cust.city}</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>{cust.fullName}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <Phone style={{ width: '13px', height: '13px' }} /> {cust.phoneNumber}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
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
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: '#FFF' }}>
                  {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>{selectedCustomer.fullName}</h2>
                  <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{selectedCustomer.phoneNumber} • {selectedCustomer.city}</p>
                </div>
              </div>

              {/* Delivery & Return Ratio Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Orders</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>{selectedCustomer.deliveredOrders}</div>
                </div>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#FDA4AF', fontWeight: 700, textTransform: 'uppercase' }}>Returns / Cancelled</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>{selectedCustomer.returnedOrders}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin style={{ width: '14px', height: '14px' }} /> Shipping Address
                </div>
                <div style={{ fontSize: '0.85rem', color: '#E5E7EB', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {selectedCustomer.address}, {selectedCustomer.city}
                </div>
              </div>

              {/* Customer Timeline Activity */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock style={{ width: '16px', height: '16px', color: '#10B981' }} /> Customer History Timeline
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid rgba(255, 255, 255, 0.08)', paddingLeft: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFF' }}>Ordered Oversized Black Hoodie (XL)</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Amount: Rs 4,749 (COD) • {selectedCustomer.lastOrdered}</div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#6366F1' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFF' }}>Inquired via WhatsApp for XL Stock</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>AI Intent extracted: AVAILABILITY</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

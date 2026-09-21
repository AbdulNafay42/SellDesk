'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  BellRing,
  Clock,
  Phone,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Search,
  User,
  ShoppingBag,
} from 'lucide-react';

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  inquiredProduct: string;
  hoursElapsed: number;
  lastMessage: string;
  suggestedFollowup: string;
  status: string;
}

const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    customerName: 'Hamza Tariq',
    customerPhone: '0312-7788990',
    city: 'Rawalpindi',
    inquiredProduct: 'Oversized Black Premium Hoodie (XL)',
    hoursElapsed: 24,
    lastMessage: 'Price kitni hai delivery charges ke sath?',
    suggestedFollowup: 'Hi Hamza! Still interested in the Oversized Black Hoodie (XL)? Only 3 remaining in stock! Reply YES to confirm COD delivery to Rawalpindi.',
    status: 'PENDING',
  },
  {
    id: 'lead-2',
    customerName: 'Sana Malik',
    customerPhone: '0301-4455667',
    city: 'Lahore',
    inquiredProduct: 'Vintage Wash Denim Jacket (M)',
    hoursElapsed: 48,
    lastMessage: 'Karachi delivery kitne din lagay gi?',
    suggestedFollowup: 'Hi Sana! Vintage Wash Denim Jacket size M is ready for dispatch. Order today for free COD delivery!',
    status: 'PENDING',
  },
  {
    id: 'lead-3',
    customerName: 'Bilal Ahmed',
    customerPhone: '0346-1122334',
    city: 'Multan',
    inquiredProduct: 'Minimalist Essential White Tee (L)',
    hoursElapsed: 12,
    lastMessage: 'Discount hosakta hai 2 tees pe?',
    suggestedFollowup: 'Hi Bilal! Special offer: Buy 2 Essential White Tees today and get Rs 300 off + Free COD shipping!',
    status: 'PENDING',
  },
];

export default function FollowupsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState('');

  const handleSendFollowup = (id: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'SENT' } : l)));
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.customerName.toLowerCase().includes(search.toLowerCase()) ||
      l.customerPhone.includes(search) ||
      l.inquiredProduct.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar />
      <Header />

      <main style={{ marginLeft: '260px', marginTop: '70px', flex: 1, padding: '32px', backgroundColor: '#090D16', minHeight: 'calc(100vh - 70px)' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BellRing style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
              Automated Follow-ups & Lead Recovery
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '4px' }}>
              Recover lost sales from WhatsApp inquiries that dropped off before placing an order.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Pending Lead Recovery</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24', marginTop: '4px' }}>
              {leads.filter((l) => l.status === 'PENDING').length} Inactive Inquiries
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Follow-up Reminders Sent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '4px' }}>
              {leads.filter((l) => l.status === 'SENT').length} Reminders Sent
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Conversion Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8', marginTop: '4px' }}>
              28.4% Recovered
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search leads by customer name, phone, or product..."
              className="input-glass"
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lead Recovery Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="glass-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '12px', height: '12px' }} /> Inactive for {lead.hoursElapsed}h
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>{lead.customerName}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>({lead.customerPhone})</span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>• {lead.city}</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#E5E7EB', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag style={{ width: '14px', height: '14px', color: '#10B981' }} />
                  <span>Inquired Item: <strong>{lead.inquiredProduct}</strong></span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '12px' }}>
                  Last Message: &ldquo;{lead.lastMessage}&rdquo;
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: '#A5B4FC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, marginBottom: '4px' }}>
                    <Sparkles style={{ width: '14px', height: '14px', color: '#818CF8' }} /> AI Suggested Follow-up Text:
                  </div>
                  &ldquo;{lead.suggestedFollowup}&rdquo;
                </div>
              </div>

              {/* Action Button */}
              <div>
                {lead.status === 'PENDING' ? (
                  <button onClick={() => handleSendFollowup(lead.id)} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '12px 20px' }}>
                    <Send style={{ width: '16px', height: '16px' }} />
                    1-Click Send WhatsApp Follow-up
                  </button>
                ) : (
                  <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Follow-up Sent
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

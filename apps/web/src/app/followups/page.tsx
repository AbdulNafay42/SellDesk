'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  BellRing,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  Search,
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
  const { activeBusinessId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchFollowups = async () => {
      if (!activeBusinessId) return;
      try {
        const data = await api.get<Lead[]>('/api/followups');
        if (isMounted) setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load followups:', err);
      }
    };
    fetchFollowups();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BellRing style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
              Automated Follow-ups & Lead Recovery
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Recover lost sales from WhatsApp inquiries that dropped off before placing an order.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Pending Lead Recovery</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>
              {leads.filter((l) => l.status === 'PENDING').length} Inactive Inquiries
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Follow-up Reminders Sent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>
              {leads.filter((l) => l.status === 'SENT').length} Reminders Sent
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Conversion Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8', marginTop: '0.25rem' }}>
              28.4% Recovered
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search leads by customer name, phone, or product..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lead Recovery Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredLeads.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
              <BellRing style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem auto', color: '#4B5563' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>0 Inactive Leads</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>No dropped customer inquiries require follow-up.</div>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead.id} className="glass-card" style={{ padding: '1.375rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '16rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> Inactive for {lead.hoursElapsed}h
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>{lead.customerName}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>({lead.customerPhone})</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>• {lead.city}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#E5E7EB', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShoppingBag style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
                    <span>Inquired Item: <strong>{lead.inquiredProduct}</strong></span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                    Last Message: &ldquo;{lead.lastMessage}&rdquo;
                  </div>

                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '0.0625rem solid rgba(99, 102, 241, 0.25)', padding: '0.75rem', borderRadius: '0.625rem', fontSize: '0.8rem', color: '#A5B4FC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#818CF8' }} /> AI Suggested Follow-up Text:
                    </div>
                    &ldquo;{lead.suggestedFollowup}&rdquo;
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  {lead.status === 'PENDING' ? (
                    <button onClick={() => handleSendFollowup(lead.id)} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.75rem 1.25rem' }}>
                      <Send style={{ width: '1rem', height: '1rem' }} />
                      1-Click Send WhatsApp Follow-up
                    </button>
                  ) : (
                    <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} /> Follow-up Sent
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

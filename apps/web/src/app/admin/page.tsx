'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  ShieldCheck,
  Building2,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Ban,
  DollarSign,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  TrendingUp,
  X,
  Send,
} from 'lucide-react';

interface ClientTenantBrand {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  whatsappPhone: string;
  city: string;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  ordersCount: number;
  monthlyRevenuePKR: number;
  joinedDate: string;
}

const initialTenants: ClientTenantBrand[] = [
  {
    id: 'biz-default',
    name: 'SellDesk Apparels PK',
    slug: 'selldesk-apparels',
    ownerName: 'Abdul Nafay',
    ownerEmail: 'abdulnafay2005@gmail.com',
    whatsappPhone: '+92 300 1234567',
    city: 'Lahore',
    plan: 'GROWTH',
    status: 'ACTIVE',
    ordersCount: 141,
    monthlyRevenuePKR: 485400,
    joinedDate: '2026-08-01',
  },
  {
    id: 'biz-102',
    name: 'Khaadi Pret Official',
    slug: 'khaadi-pret',
    ownerName: 'Kamran Akmal',
    ownerEmail: 'kamran@khaadi.com.pk',
    whatsappPhone: '+92 312 9988776',
    city: 'Karachi',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    ordersCount: 842,
    monthlyRevenuePKR: 2940000,
    joinedDate: '2026-08-10',
  },
  {
    id: 'biz-103',
    name: 'Sapphire Eastern Wear',
    slug: 'sapphire-eastern',
    ownerName: 'Tariq Mehmood',
    ownerEmail: 'tariq@sapphire.pk',
    whatsappPhone: '+92 345 4433221',
    city: 'Lahore',
    plan: 'GROWTH',
    status: 'ACTIVE',
    ordersCount: 420,
    monthlyRevenuePKR: 1450000,
    joinedDate: '2026-08-18',
  },
  {
    id: 'biz-104',
    name: 'Outfitters Streetwear',
    slug: 'outfitters-street',
    ownerName: 'Zubair Shah',
    ownerEmail: 'zubair@outfitters.com.pk',
    whatsappPhone: '+92 301 5544332',
    city: 'Rawalpindi',
    plan: 'STARTER',
    status: 'TRIAL',
    ordersCount: 48,
    monthlyRevenuePKR: 168000,
    joinedDate: '2026-09-12',
  },
];

export default function AdminPortalPage() {
  const [tenants, setTenants] = useState<ClientTenantBrand[]>(initialTenants);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Provision Modal state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [plan, setPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newTenant: ClientTenantBrand = {
      id: `biz-${Date.now()}`,
      name: brandName,
      slug: slug,
      ownerName: ownerName,
      ownerEmail: ownerEmail,
      whatsappPhone: whatsappPhone,
      city: city,
      plan: plan,
      status: 'ACTIVE',
      ordersCount: 0,
      monthlyRevenuePKR: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setTenants([newTenant, ...tenants]);
    setIsProvisionModalOpen(false);
    setBrandName('');
    setOwnerName('');
    setOwnerEmail('');
    setWhatsappPhone('');
  };

  const handleToggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : t
      )
    );
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase())
  );

  const getPlanBadge = (p: string) => {
    switch (p) {
      case 'ENTERPRISE':
        return <span className="badge badge-indigo">Enterprise</span>;
      case 'GROWTH':
        return <span className="badge badge-success">Growth Plan</span>;
      default:
        return <span className="badge badge-warning">Starter Plan</span>;
    }
  };

  const totalMRR = tenants
    .filter((t) => t.status === 'ACTIVE')
    .reduce((sum, t) => sum + (t.plan === 'ENTERPRISE' ? 14999 : t.plan === 'GROWTH' ? 6999 : 2999), 0);

  const totalOrders = tenants.reduce((sum, t) => sum + t.ordersCount, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ width: '1.5rem', height: '1.5rem', color: '#6366F1' }} />
              Super-Admin SaaS Platform Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Platform control panel for provisioning, monitoring, and managing Pakistani client clothing brands.
            </p>
          </div>

          <button onClick={() => setIsProvisionModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '1rem', height: '1rem' }} /> Provision New Client Brand Store
          </button>
        </div>

        {/* Platform Overview Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Registered Brands</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>
              {tenants.length} Client Stores
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Monthly SaaS MRR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>
              Rs {totalMRR.toLocaleString()} / mo
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total WhatsApp Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818CF8', marginTop: '0.25rem' }}>
              {totalOrders.toLocaleString()} Orders
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>AI Messages Processed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>
              {(totalOrders * 4).toLocaleString()} Conversations
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search client brand stores by name, email, or city..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Client Brands Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Client Brand Store</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Owner Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>SaaS Plan</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Store Volume</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((ten) => (
                  <tr key={ten.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#FFF' }}>{ten.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>slug: /{ten.slug} • {ten.city}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#E5E7EB' }}>{ten.ownerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#34D399' }}>{ten.whatsappPhone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{ten.ownerEmail}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{getPlanBadge(ten.plan)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{ten.ordersCount} orders</div>
                      <div style={{ fontSize: '0.75rem', color: '#34D399' }}>Rs {ten.monthlyRevenuePKR.toLocaleString()}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {ten.status === 'ACTIVE' ? (
                        <span className="badge badge-success">Active</span>
                      ) : ten.status === 'TRIAL' ? (
                        <span className="badge badge-warning">Trial</span>
                      ) : (
                        <span className="badge badge-rose">Suspended</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(ten.id)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                      >
                        {ten.status === 'ACTIVE' ? (
                          <>
                            <Ban style={{ width: '0.875rem', height: '0.875rem', color: '#F43F5E' }} /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem', color: '#34D399' }} /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provision New Client Brand Store Drawer Modal */}
        {isProvisionModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(0.5rem)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '32rem', padding: '1.75rem', backgroundColor: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 style={{ width: '1.25rem', height: '1.25rem', color: '#6366F1' }} />
                  Provision New Client Brand Store
                </h3>
                <button onClick={() => setIsProvisionModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleProvisionTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem', fontWeight: 600 }}>Brand / Store Name</label>
                  <input type="text" placeholder="e.g. Maria B. Official" className="input-glass" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Owner Full Name</label>
                    <input type="text" placeholder="Owner Name" className="input-glass" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Owner Email</label>
                    <input type="email" placeholder="owner@brand.com" className="input-glass" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>WhatsApp Business Number</label>
                    <input type="text" placeholder="+92 300 0000000" className="input-glass" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Primary City Hub</label>
                    <select className="input-glass" value={city} onChange={(e) => setCity(e.target.value)}>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Multan">Multan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Select Initial SaaS Plan Tier</label>
                  <select className="input-glass" value={plan} onChange={(e) => setPlan(e.target.value as any)}>
                    <option value="STARTER">Starter Plan (Rs 2,999/mo)</option>
                    <option value="GROWTH">Growth Plan (Rs 6,999/mo)</option>
                    <option value="ENTERPRISE">Enterprise Plan (Rs 14,999/mo)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsProvisionModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Send style={{ width: '1rem', height: '1rem' }} /> Launch & Provision Brand
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

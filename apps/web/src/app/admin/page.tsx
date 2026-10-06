'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

import { api } from '@/lib/api';

interface ClientTenantBrand {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  whatsappPhone: string;
  city: string;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  ordersCount: number;
  monthlyRevenuePKR: number;
  joinedDate: string;
}

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [tenants, setTenants] = useState<ClientTenantBrand[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTenants = async () => {
    try {
      setIsFetching(true);
      const data = await api.get<ClientTenantBrand[]>('/api/admin/tenants');
      setTenants(data || []);
    } catch (err) {
      console.error('Failed to fetch tenants from API:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (user?.platformRole !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else {
        fetchTenants();
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.platformRole !== 'SUPER_ADMIN') {
    return null;
  }

  // Provision Modal state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [plan, setPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/tenants/provision', {
        name: brandName,
        ownerName,
        ownerEmail,
        whatsappPhone,
        city,
        plan,
      });
      setIsProvisionModalOpen(false);
      setBrandName('');
      setOwnerName('');
      setOwnerEmail('');
      setWhatsappPhone('');
      await fetchTenants();
    } catch (err) {
      console.error('Failed to provision tenant:', err);
    }
  };

  const [approvalModalData, setApprovalModalData] = useState<{
    businessName: string;
    invitationUrl: string;
  } | null>(null);

  const handleApproveBusiness = async (id: string, name: string) => {
    try {
      const res = await api.patch<any>(`/api/admin/businesses/${id}/approve`, {});
      if (res && res.invitation?.token) {
        const url = `${window.location.origin}/invite/${res.invitation.token}`;
        setApprovalModalData({
          businessName: name,
          invitationUrl: url,
        });
      }
      await fetchTenants();
    } catch (err) {
      console.error('Failed to approve business:', err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/admin/tenants/${id}/status`, {});
      await fetchTenants();
    } catch (err) {
      console.error('Failed to toggle tenant status:', err);
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Title Section */}
        <div className="admin-header-row">
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', lineHeight: 1.25 }}>
              <ShieldCheck style={{ width: '1.5rem', height: '1.5rem', color: '#6366F1', flexShrink: 0 }} />
              <span>Super-Admin SaaS Platform Management</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '0.35rem', lineHeight: 1.4 }}>
              Platform control panel for provisioning, monitoring, and managing Pakistani client clothing brands.
            </p>
          </div>

          <button onClick={() => setIsProvisionModalOpen(true)} className="btn-primary admin-action-btn-mobile" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Plus style={{ width: '1rem', height: '1rem' }} /> Provision New Client Brand Store
          </button>
        </div>

        {/* Platform Overview Metric Cards */}
        <div className="admin-metrics-grid">
          <div className="glass-card" style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Registered Brands</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginTop: '0.2rem' }}>
              {tenants.length} Client Stores
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Monthly SaaS MRR</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399', marginTop: '0.2rem' }}>
              Rs {(totalMRR ?? 0).toLocaleString()} / mo
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total WhatsApp Orders</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818CF8', marginTop: '0.2rem' }}>
              {(totalOrders ?? 0).toLocaleString()} Orders
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Messages Processed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.2rem' }}>
              {((totalOrders ?? 0) * 4).toLocaleString()} Conversations
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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

        {/* Client Brands Container */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          {/* Mobile Card List View (< 640px) */}
          <div className="admin-tenant-mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filteredTenants.map((ten) => (
              <div
                key={ten.id}
                style={{
                  background: 'rgba(31, 41, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FFF', fontSize: '1rem' }}>{ten.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.1rem' }}>
                      slug: /{ten.slug} • {ten.city}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {ten.status === 'APPROVED' || ten.status === 'ACTIVE' ? (
                      <span className="badge badge-success">Active</span>
                    ) : ten.status === 'PENDING' ? (
                      <span className="badge badge-warning">Pending</span>
                    ) : ten.status === 'TRIAL' ? (
                      <span className="badge badge-warning">Trial</span>
                    ) : (
                      <span className="badge badge-rose">{ten.status || 'Suspended'}</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
                >
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#E5E7EB' }}>{ten.ownerName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 600 }}>{ten.whatsappPhone}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', overflowWrap: 'anywhere' }}>{ten.ownerEmail}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {getPlanBadge(ten.plan)}
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {ten.ordersCount} orders • Rs {(ten.monthlyRevenuePKR ?? 0).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    {ten.status === 'PENDING' ? (
                      <button
                        onClick={() => handleApproveBusiness(ten.id, ten.name)}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem' }}
                      >
                        <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(ten.id)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem' }}
                      >
                        {ten.status === 'APPROVED' || ten.status === 'ACTIVE' ? (
                          <>
                            <Ban style={{ width: '0.75rem', height: '0.75rem', color: '#F43F5E' }} /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem', color: '#34D399' }} /> Activate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 640px) */}
          <div className="admin-tenant-desktop-table table-responsive-container">
            <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Client Brand Store</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Owner Contact</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>SaaS Plan</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Store Volume</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((ten) => (
                  <tr key={ten.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: '#FFF' }}>{ten.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>slug: /{ten.slug} • {ten.city}</div>
                    </td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#E5E7EB' }}>{ten.ownerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#34D399' }}>{ten.whatsappPhone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{ten.ownerEmail}</div>
                    </td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{getPlanBadge(ten.plan)}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{ten.ordersCount} orders</div>
                      <div style={{ fontSize: '0.75rem', color: '#34D399' }}>Rs {(ten.monthlyRevenuePKR ?? 0).toLocaleString()}</div>
                    </td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      {ten.status === 'APPROVED' || ten.status === 'ACTIVE' ? (
                        <span className="badge badge-success">Active</span>
                      ) : ten.status === 'PENDING' ? (
                        <span className="badge badge-warning">Pending Approval</span>
                      ) : ten.status === 'TRIAL' ? (
                        <span className="badge badge-warning">Trial</span>
                      ) : (
                        <span className="badge badge-rose">{ten.status || 'Suspended'}</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {ten.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApproveBusiness(ten.id, ten.name)}
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        >
                          <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} /> Approve Store
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(ten.id)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        >
                          {ten.status === 'APPROVED' || ten.status === 'ACTIVE' ? (
                            <>
                              <Ban style={{ width: '0.875rem', height: '0.875rem', color: '#F43F5E' }} /> Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem', color: '#34D399' }} /> Activate
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 639px) {
            .admin-tenant-desktop-table {
              display: none !important;
            }
            .admin-tenant-mobile-list {
              display: flex !important;
            }
          }
          @media (min-width: 640px) {
            .admin-tenant-desktop-table {
              display: block !important;
            }
            .admin-tenant-mobile-list {
              display: none !important;
            }
          }
        `}</style>

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

                <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Owner Full Name</label>
                    <input type="text" placeholder="Owner Name" className="input-glass" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Owner Email</label>
                    <input type="email" placeholder="owner@brand.com" className="input-glass" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
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

        {/* Approval Success & Invitation Link Modal */}
        {approvalModalData && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(0.5rem)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '30rem', padding: '1.75rem', backgroundColor: '#111827', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem' }} /> Store Approved Successfully!
                </h3>
                <button onClick={() => setApprovalModalData(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                <strong style={{ color: '#FFF' }}>{approvalModalData.businessName}</strong> has been approved. The owner can now log in directly, or click this invitation link to set a new password:
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', fontWeight: 700 }}>INVITATION LINK</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    readOnly
                    value={approvalModalData.invitationUrl}
                    className="input-glass"
                    style={{ fontSize: '0.8rem', color: '#34D399' }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(approvalModalData.invitationUrl)}
                    className="btn-secondary"
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setApprovalModalData(null)} className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

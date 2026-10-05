'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Settings,
  Building2,
  Users,
  CreditCard,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Save,
  X,
  Copy,
  Link2,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SALES_AGENT' | 'INVENTORY_MANAGER';
  status: 'ACTIVE' | 'INVITED';
  joinedDate: string;
  inviteToken?: string;
}

interface SubscriptionBilling {
  currentPlan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  monthlyFeePKR: number;
  billingCycle: string;
  nextBillingDate: string;
  usageMeters: {
    ordersThisMonth: number;
    maxOrders: number;
    teamMembersCount: number;
    maxTeamMembers: number;
    aiResponsesUsed: number;
    maxAiResponses: number;
  };
  invoices: Array<{ id: string; invoiceNumber?: string; date: string; amountPKR: number; status: string; pdfUrl: string }>;
}

export default function SettingsPage() {
  const { activeBusinessId } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing'>('profile');

  // Business profile form state
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('Instagram Apparel & Clothing Store');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');

  // Team state & invite modal
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [billing, setBilling] = useState<SubscriptionBilling | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'OWNER' | 'ADMIN' | 'STAFF' | 'SALES_AGENT' | 'INVENTORY_MANAGER'>('SALES_AGENT');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    if (!activeBusinessId) return;
    try {
      const profile = await api.get<any>('/api/settings/business');
      if (profile) {
        setBizName(profile.name || '');
        setWhatsapp(profile.whatsappNumber || profile.phone || '');
        setCity(profile.city || '');
        setAddress(profile.address || '');
      }
      const teamData = await api.get<TeamMember[]>('/api/settings/team');
      if (Array.isArray(teamData)) {
        setTeam(teamData);
      }
      const billingData = await api.get<SubscriptionBilling>('/api/settings/billing');
      if (billingData) {
        setBilling(billingData);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [activeBusinessId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/settings/business', {
        name: bizName,
        city,
        whatsappNumber: whatsapp,
        category,
        address,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      await fetchSettings();
    } catch (err) {
      console.error('Failed to update business profile:', err);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/settings/team/invite', {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
      });
      setIsInviteModalOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      await fetchSettings();
    } catch (err) {
      console.error('Failed to invite team member:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <span className="badge badge-success"><ShieldCheck style={{ width: '0.75rem', height: '0.75rem' }} /> Store Owner</span>;
      case 'ADMIN':
        return <span className="badge badge-indigo">Store Admin</span>;
      case 'SALES_AGENT':
        return <span className="badge badge-warning">WhatsApp Sales Agent</span>;
      case 'INVENTORY_MANAGER':
        return <span className="badge">Inventory Manager</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyAccessLink = (mem: TeamMember) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const accessUrl = mem.inviteToken
      ? `${origin}/invite/${mem.inviteToken}`
      : `${origin}/login?email=${encodeURIComponent(mem.email)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(accessUrl);
    }
    setCopiedEmail(mem.name);
    setTimeout(() => setCopiedEmail(null), 4000);
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
              <Settings style={{ width: '1.5rem', height: '1.5rem', color: '#6366F1' }} />
              Store Settings & Team Governance
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Manage business credentials, team access permissions (RBAC), and SaaS subscription plan.
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: activeTab === 'profile' ? '0.0625rem solid #6366F1' : '0.0625rem solid transparent',
              color: activeTab === 'profile' ? '#FFF' : '#9CA3AF',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Building2 style={{ width: '1rem', height: '1rem' }} /> Business Profile
          </button>

          <button
            onClick={() => setActiveTab('team')}
            style={{
              background: activeTab === 'team' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              border: activeTab === 'team' ? '0.0625rem solid #10B981' : '0.0625rem solid transparent',
              color: activeTab === 'team' ? '#FFF' : '#9CA3AF',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Users style={{ width: '1rem', height: '1rem' }} /> Team & Permissions ({team.length})
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            style={{
              background: activeTab === 'billing' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              border: activeTab === 'billing' ? '0.0625rem solid #F59E0B' : '0.0625rem solid transparent',
              color: activeTab === 'billing' ? '#FFF' : '#9CA3AF',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <CreditCard style={{ width: '1rem', height: '1rem' }} /> SaaS Plan & Billing
          </button>
        </div>

        {/* TAB 1: BUSINESS PROFILE */}
        {activeTab === 'profile' && (
          <div className="glass-card" style={{ padding: '1.75rem', maxWidth: '44rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 style={{ width: '1.25rem', height: '1.25rem', color: '#6366F1' }} />
              Business Identity & Operations Profile
            </h2>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>Business Name</label>
                  <input type="text" className="input-glass" value={bizName} onChange={(e) => setBizName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>Business Category</label>
                  <input type="text" className="input-glass" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>WhatsApp Business Number</label>
                  <input type="text" className="input-glass" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>Default Currency</label>
                  <input type="text" className="input-glass" value="PKR (Pakistani Rupee)" readOnly disabled style={{ opacity: 0.7 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>Warehouse City Hub</label>
                  <select className="input-glass" value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>FBR NTN Tax Number (Optional)</label>
                  <input type="text" className="input-glass" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>Full Dispatch Warehouse Address</label>
                <textarea className="input-glass" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                {savedSuccess ? (
                  <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Settings Saved Successfully!
                  </span>
                ) : <span />}

                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  <Save style={{ width: '1rem', height: '1rem' }} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: TEAM & RBAC PERMISSIONS */}
        {activeTab === 'team' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>Team Members & Access Roles</h2>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Control which agents can view sales revenue, manage stock, or reply to chats.</p>
              </div>

              <button onClick={() => setIsInviteModalOpen(true)} className="btn-primary">
                <UserPlus style={{ width: '1rem', height: '1rem' }} /> Invite Team Member
              </button>
            </div>

            {copiedEmail && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '0.0625rem solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 1rem', borderRadius: '0.625rem', marginBottom: '1rem', color: '#34D399', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Invitation Access Link Copied for {copiedEmail}! Share it via WhatsApp or Email so they can set their password.
              </div>
            )}

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="table-responsive-container">
                {team.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                    <Users style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem auto', color: '#4B5563' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>0 Team Members</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>No additional team members invited yet.</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Team Member</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Assigned RBAC Role</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.map((mem) => (
                        <tr key={mem.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#FFF' }}>{mem.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{mem.email}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>{getRoleBadge(mem.role)}</td>
                          <td style={{ padding: '1rem' }}>
                            {mem.status === 'ACTIVE' ? (
                              <span className="badge badge-success">Active</span>
                            ) : (
                              <span className="badge badge-warning">Invitation Sent</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: '#9CA3AF', fontSize: '0.8rem' }}>{mem.joinedDate}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {mem.role === 'OWNER' ? (
                              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic' }}>
                                Account Creator (Owner)
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCopyAccessLink(mem)}
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}
                                title="Copy Tokenized Invite Link for password setup"
                              >
                                <Link2 style={{ width: '0.75rem', height: '0.75rem' }} /> Copy Access Link
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAAS SUBSCRIPTION & BILLING */}
        {activeTab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Active Subscription Banner */}
            <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(17, 24, 39, 0.9) 100%)', border: '0.0625rem solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Active Plan</span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>SellDesk {billing?.currentPlan || 'GROWTH'} SaaS Tier</h2>
                  <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                    Rs {(billing?.monthlyFeePKR || 6999).toLocaleString()} / month • Auto-renews on {billing?.nextBillingDate || 'October 1, 2026'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-secondary">Change Subscription</button>
                  <button className="btn-primary">Upgrade to Enterprise</button>
                </div>
              </div>

              {/* Metered Usage Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                    <span>Monthly Orders</span>
                    <span>{billing?.usageMeters.ordersThisMonth || 0} / {(billing?.usageMeters.maxOrders || 1000).toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', height: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px' }}>
                    <div style={{ width: `${Math.min(100, Math.round(((billing?.usageMeters.ordersThisMonth || 0) / (billing?.usageMeters.maxOrders || 1000)) * 100))}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                    <span>Team Seats</span>
                    <span>{billing?.usageMeters.teamMembersCount || 0} / {billing?.usageMeters.maxTeamMembers || 10} seats</span>
                  </div>
                  <div style={{ width: '100%', height: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px' }}>
                    <div style={{ width: `${Math.min(100, Math.round(((billing?.usageMeters.teamMembersCount || 0) / (billing?.usageMeters.maxTeamMembers || 10)) * 100))}%`, height: '100%', backgroundColor: '#6366F1', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                    <span>AI Assistant Queries</span>
                    <span>{billing?.usageMeters.aiResponsesUsed || 0} / {(billing?.usageMeters.maxAiResponses || 5000).toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', height: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px' }}>
                    <div style={{ width: `${Math.min(100, Math.round(((billing?.usageMeters.aiResponsesUsed || 0) / (billing?.usageMeters.maxAiResponses || 5000)) * 100))}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Receipts Table */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '1rem' }}>
                SaaS Invoice Billing Receipts
              </h3>

              <div className="table-responsive-container">
                {!billing?.invoices || billing.invoices.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                    <CreditCard style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem auto', color: '#4B5563' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>0 Billing Receipts</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>No billing invoices recorded for this business yet.</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                        <th style={{ padding: '0.625rem 1rem' }}>Invoice ID</th>
                        <th style={{ padding: '0.625rem 1rem' }}>Date</th>
                        <th style={{ padding: '0.625rem 1rem' }}>Amount (PKR)</th>
                        <th style={{ padding: '0.625rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.625rem 1rem', textAlign: 'right' }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.invoices.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#FFF' }}>{inv.invoiceNumber || inv.id}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>{inv.date}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#34D399' }}>Rs {inv.amountPKR.toLocaleString()}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button className="btn-secondary" style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}>
                              <Download style={{ width: '0.75rem', height: '0.75rem' }} /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invite Member Drawer Modal */}
        {isInviteModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(0.5rem)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '28rem', padding: '1.75rem', backgroundColor: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                  Invite New Team Member
                </h3>
                <button onClick={() => setIsInviteModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleInviteMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Full Name</label>
                  <input type="text" placeholder="Zahra Fatima" className="input-glass" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Email Address</label>
                  <input type="email" placeholder="zahra@selldesk.pk" className="input-glass" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Assign Access Role (RBAC)</label>
                  <select className="input-glass" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as any)}>
                    <option value="SALES_AGENT">WhatsApp Sales Agent</option>
                    <option value="INVENTORY_MANAGER">Inventory Manager</option>
                    <option value="ADMIN">Store Administrator</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsInviteModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <UserPlus style={{ width: '1rem', height: '1rem' }} /> Send Invite
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

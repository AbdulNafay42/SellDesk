'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Search, RefreshCw, Eye, Building2, CheckCircle2, UserCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  platformRole: 'SUPER_ADMIN' | 'USER';
  createdAt: string;
  membershipsCount: number;
  primaryBusiness: {
    id: string;
    name: string;
    status: string;
    tenantRole: string;
  } | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'USER'>('ALL');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/users?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (roleFilter !== 'ALL') url += `role=${roleFilter}&`;
      const data = await api.get<AdminUser[]>(url);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user?.platformRole !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [authLoading, user, roleFilter]);

  const handleInspectUser = async (userId: string) => {
    try {
      const details = await api.get<any>(`/api/admin/users/${userId}`);
      setSelectedUser(details);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to inspect user:', err);
    }
  };

  return (
    <div style={{ color: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF' }}>
            <Users style={{ width: '2rem', height: '2rem', color: '#818CF8' }} /> Platform Users Control Plane
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            View and manage user accounts across all SellDesk tenants.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818CF8',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Refresh Users
        </button>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#6B7280' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.5rem',
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFF',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['ALL', 'SUPER_ADMIN', 'USER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: roleFilter === r ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                color: roleFilter === r ? '#FFF' : '#9CA3AF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
              }}
            >
              {r === 'ALL' ? 'All Roles' : r === 'SUPER_ADMIN' ? 'Super Admins' : 'Store Users'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: 'rgba(17, 24, 39, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading platform users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No platform users found matching criteria.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(31, 41, 55, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9CA3AF' }}>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Platform Role</th>
                <th style={{ padding: '1rem' }}>Primary Business</th>
                <th style={{ padding: '1rem' }}>Tenant Role</th>
                <th style={{ padding: '1rem' }}>Joined Date</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#FFF' }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: u.platformRole === 'SUPER_ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(156, 163, 175, 0.15)',
                      color: u.platformRole === 'SUPER_ADMIN' ? '#818CF8' : '#D1D5DB',
                      border: u.platformRole === 'SUPER_ADMIN' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      {u.platformRole}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: u.primaryBusiness ? '#E5E7EB' : '#6B7280' }}>
                    {u.primaryBusiness ? u.primaryBusiness.name : 'No Store'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.primaryBusiness ? (
                      <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>{u.primaryBusiness.tenantRole}</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: '#9CA3AF' }}>{u.createdAt}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleInspectUser(u.id)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.375rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: '#FFF',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      <Eye style={{ width: '0.875rem', height: '0.875rem' }} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Inspect Modal */}
      {modalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '600px', color: '#FFF' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>User Profile Details</h2>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div><strong>ID:</strong> {selectedUser.id}</div>
              <div><strong>Name:</strong> {selectedUser.fullName}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}</div>
              <div><strong>Platform Role:</strong> {selectedUser.platformRole}</div>
              <div><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#818CF8', marginBottom: '0.5rem' }}>Store Memberships ({selectedUser.memberships?.length || 0})</h3>
            {selectedUser.memberships?.map((m: any) => (
              <div key={m.id} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600 }}>{m.business.name} ({m.business.slug})</div>
                <div style={{ color: '#9CA3AF' }}>Role: {m.role} | Status: {m.business.status}</div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: '#374151', color: '#FFF', border: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

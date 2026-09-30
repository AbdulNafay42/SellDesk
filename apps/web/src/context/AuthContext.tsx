'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  platformRole: 'SUPER_ADMIN' | 'USER';
}

export interface Business {
  id: string;
  name: string;
  city?: string;
  country?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

export interface Membership {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  businessId: string;
  business: Business;
}

export interface ActiveBusiness extends Business {
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  memberships: Membership[];
  activeBusinessId: string | null;
  activeBusiness: ActiveBusiness | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: User; accessToken: string; memberships: Membership[] }>;
  register: (dto: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    city: string;
    country: string;
  }) => Promise<any>;
  logout: () => void;
  selectBusiness: (businessId: string) => void;
  refreshAuth: () => Promise<Membership[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<ActiveBusiness | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync activeBusiness object whenever activeBusinessId or memberships change
  useEffect(() => {
    if (!activeBusinessId || !memberships.length) {
      setActiveBusiness(null);
      return;
    }

    const found = memberships.find((m) => m.businessId === activeBusinessId || m.business?.id === activeBusinessId);
    if (found) {
      const bObj = found.business || {
        id: found.businessId,
        name: (found as any).businessName || 'Business',
        city: (found as any).city || 'Pakistan',
        country: 'Pakistan',
        status: (found as any).status || 'PENDING',
      };
      setActiveBusiness({
        ...bObj,
        status: bObj.status || (found as any).status || 'PENDING',
        role: found.role,
      });
    } else {
      setActiveBusiness(null);
    }
  }, [activeBusinessId, memberships]);

  // Initial auth check on mount
  useEffect(() => {
    let isMounted = true;

    // Safety fallback timer: guarantee isLoading becomes false within 2.5s
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 2500);

    const initAuth = async () => {
      const storedToken = localStorage.getItem('selldesk_auth_token');
      const storedTenantId = localStorage.getItem('selldesk_active_tenant_id');

      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        clearTimeout(safetyTimer);
        return;
      }

      if (isMounted) setToken(storedToken);

      try {
        // Fetch current user
        const userData = await api.get<User>('/api/auth/me');
        if (isMounted) setUser(userData);

        // Fetch memberships
        const memData = await api.get<Membership[]>('/api/auth/memberships');
        if (isMounted) setMemberships(memData || []);

        // Active business selection
        if (storedTenantId && memData.some((m) => m.businessId === storedTenantId || m.business?.id === storedTenantId)) {
          if (isMounted) setActiveBusinessId(storedTenantId);
        } else if (memData.length === 1) {
          const autoId = memData[0].businessId || memData[0].business?.id;
          if (isMounted) setActiveBusinessId(autoId);
          localStorage.setItem('selldesk_active_tenant_id', autoId);
        } else {
          if (isMounted) setActiveBusinessId(null);
          localStorage.removeItem('selldesk_active_tenant_id');
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('selldesk_auth_token');
        localStorage.removeItem('selldesk_active_tenant_id');
        if (isMounted) {
          setToken(null);
          setUser(null);
          setMemberships([]);
          setActiveBusinessId(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ accessToken: string; user: User; memberships?: Membership[] }>(
        '/api/auth/login',
        { email, password }
      );

      const accessToken = res.accessToken;
      const loggedUser = res.user;
      let fetchedMemberships: Membership[] = res.memberships || [];

      // Save token in state & storage
      localStorage.setItem('selldesk_auth_token', accessToken);
      setToken(accessToken);
      setUser(loggedUser);

      // If memberships weren't returned directly in login response, fetch them
      if (!fetchedMemberships || fetchedMemberships.length === 0) {
        try {
          fetchedMemberships = await api.get<Membership[]>('/api/auth/memberships');
        } catch {
          fetchedMemberships = [];
        }
      }

      setMemberships(fetchedMemberships);

      // Handle active business selection logic
      if (fetchedMemberships.length === 1) {
        const tenantId = fetchedMemberships[0].businessId || fetchedMemberships[0].business?.id;
        setActiveBusinessId(tenantId);
        localStorage.setItem('selldesk_active_tenant_id', tenantId);
      } else {
        setActiveBusinessId(null);
        localStorage.removeItem('selldesk_active_tenant_id');
      }

      return { user: loggedUser, accessToken, memberships: fetchedMemberships };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    city: string;
    country: string;
  }) => {
    const res = await api.post<any>('/api/auth/register', dto);
    if (res && res.accessToken) {
      localStorage.setItem('selldesk_auth_token', res.accessToken);
      setToken(res.accessToken);
      if (res.user) setUser(res.user);
      if (res.memberships) setMemberships(res.memberships);
      if (res.business?.id) {
        setActiveBusinessId(res.business.id);
        localStorage.setItem('selldesk_active_tenant_id', res.business.id);
      }
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('selldesk_auth_token');
    localStorage.removeItem('selldesk_active_tenant_id');
    setToken(null);
    setUser(null);
    setMemberships([]);
    setActiveBusinessId(null);
    setActiveBusiness(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const selectBusiness = (businessId: string) => {
    setActiveBusinessId(businessId);
    localStorage.setItem('selldesk_active_tenant_id', businessId);
    // Notify window for legacy listeners if any
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('selldesk_tenant_changed'));
    }
  };

  const refreshAuth = async (): Promise<Membership[]> => {
    const currentToken = localStorage.getItem('selldesk_auth_token');
    if (!currentToken) return [];

    try {
      const userData = await api.get<User>('/api/auth/me');
      setUser(userData);
      const memData = await api.get<Membership[]>('/api/auth/memberships');
      setMemberships(memData || []);
      return memData || [];
    } catch (err) {
      console.error('Failed to refresh auth state:', err);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        memberships,
        activeBusinessId,
        activeBusiness,
        isLoading,
        login,
        register,
        logout,
        selectBusiness,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

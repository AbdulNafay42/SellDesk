import { Injectable } from '@nestjs/common';

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  whatsappNumber: string;
  currency: string;
  city: string;
  address: string;
  taxNumber?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'SALES_AGENT' | 'INVENTORY_MANAGER';
  status: 'ACTIVE' | 'INVITED';
  joinedDate: string;
}

export interface SubscriptionBilling {
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
  invoices: Array<{ id: string; date: string; amountPKR: number; status: string; pdfUrl: string }>;
}

@Injectable()
export class SettingsService {
  private businessStore: Record<string, BusinessProfile> = {
    'biz-default': {
      id: 'biz-default',
      name: 'SellDesk Apparels PK',
      category: 'Instagram Apparel & Clothing Store',
      whatsappNumber: '+92 300 1234567',
      currency: 'PKR',
      city: 'Lahore',
      address: 'Al-Hafeez Executive Tower, Gulberg III, Lahore',
      taxNumber: 'NTN-8822019-4',
    },
  };

  private teamStore: Record<string, TeamMember[]> = {
    'biz-default': [
      {
        id: 'usr-1',
        name: 'Abdul Nafay',
        email: 'abdulnafay2005@gmail.com',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedDate: '2026-08-01',
      },
      {
        id: 'usr-2',
        name: 'Usman Ghani',
        email: 'usman.sales@selldesk.pk',
        role: 'SALES_AGENT',
        status: 'ACTIVE',
        joinedDate: '2026-08-15',
      },
    ],
  };

  getBusiness(businessId: string): BusinessProfile {
    if (!this.businessStore[businessId]) {
      this.businessStore[businessId] = {
        id: businessId,
        name: 'My Apparel Business',
        category: 'Apparel & Clothing Store',
        whatsappNumber: '+92 300 0000000',
        currency: 'PKR',
        city: 'Lahore',
        address: 'Warehouse Hub Address, Pakistan',
      };
    }
    return this.businessStore[businessId];
  }

  updateBusiness(dto: Partial<BusinessProfile>, businessId: string): BusinessProfile {
    const current = this.getBusiness(businessId);
    this.businessStore[businessId] = { ...current, ...dto, id: businessId };
    return this.businessStore[businessId];
  }

  getTeam(businessId: string): TeamMember[] {
    return this.teamStore[businessId] || [];
  }

  inviteTeamMember(
    dto: { name: string; email: string; role: 'OWNER' | 'ADMIN' | 'SALES_AGENT' | 'INVENTORY_MANAGER' },
    businessId: string,
  ): TeamMember {
    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      status: 'INVITED',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    if (!this.teamStore[businessId]) {
      this.teamStore[businessId] = [];
    }
    this.teamStore[businessId].push(newMember);
    return newMember;
  }

  getBilling(businessId: string): SubscriptionBilling {
    if (businessId === 'biz-default') {
      return {
        currentPlan: 'GROWTH',
        monthlyFeePKR: 6999,
        billingCycle: 'Monthly (Auto-renew)',
        nextBillingDate: '2026-10-01',
        usageMeters: {
          ordersThisMonth: 141,
          maxOrders: 1000,
          teamMembersCount: 4,
          maxTeamMembers: 10,
          aiResponsesUsed: 412,
          maxAiResponses: 5000,
        },
        invoices: [
          { id: 'INV-2026-09', date: '2026-09-01', amountPKR: 6999, status: 'PAID', pdfUrl: '/invoices/INV-2026-09.pdf' },
        ],
      };
    }

    return {
      currentPlan: 'STARTER',
      monthlyFeePKR: 2999,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-10-01',
      usageMeters: {
        ordersThisMonth: 0,
        maxOrders: 250,
        teamMembersCount: (this.teamStore[businessId] || []).length || 1,
        maxTeamMembers: 3,
        aiResponsesUsed: 0,
        maxAiResponses: 1000,
      },
      invoices: [],
    };
  }
}

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
  private business: BusinessProfile = {
    id: 'biz-default',
    name: 'SellDesk Apparels PK',
    category: 'Instagram Apparel & Clothing Store',
    whatsappNumber: '+92 300 1234567',
    currency: 'PKR',
    city: 'Lahore',
    address: 'Al-Hafeez Executive Tower, Gulberg III, Lahore',
    taxNumber: 'NTN-8822019-4',
  };

  private team: TeamMember[] = [
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
    {
      id: 'usr-3',
      name: 'Hassan Raza',
      email: 'hassan.inv@selldesk.pk',
      role: 'INVENTORY_MANAGER',
      status: 'ACTIVE',
      joinedDate: '2026-09-02',
    },
    {
      id: 'usr-4',
      name: 'Zahra Fatima',
      email: 'zahra.support@selldesk.pk',
      role: 'SALES_AGENT',
      status: 'INVITED',
      joinedDate: '2026-09-20',
    },
  ];

  private billing: SubscriptionBilling = {
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
      { id: 'INV-2026-08', date: '2026-08-01', amountPKR: 6999, status: 'PAID', pdfUrl: '/invoices/INV-2026-08.pdf' },
    ],
  };

  getBusiness(): BusinessProfile {
    return this.business;
  }

  updateBusiness(dto: Partial<BusinessProfile>): BusinessProfile {
    this.business = { ...this.business, ...dto };
    return this.business;
  }

  getTeam(): TeamMember[] {
    return this.team;
  }

  inviteTeamMember(dto: { name: string; email: string; role: 'OWNER' | 'ADMIN' | 'SALES_AGENT' | 'INVENTORY_MANAGER' }): TeamMember {
    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      status: 'INVITED',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    this.team.push(newMember);
    return newMember;
  }

  getBilling(): SubscriptionBilling {
    return this.billing;
  }
}

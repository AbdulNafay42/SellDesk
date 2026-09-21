import { Injectable, NotFoundException } from '@nestjs/common';

export interface ClientTenantBrand {
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

export interface PlatformMetrics {
  totalTenantsCount: number;
  activeTenantsCount: number;
  mrrPKR: number;
  totalOrdersProcessed: number;
  totalWhatsappMessagesProcessed: number;
}

@Injectable()
export class AdminService {
  private tenants: ClientTenantBrand[] = [
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

  getMetrics(): PlatformMetrics {
    const active = this.tenants.filter((t) => t.status === 'ACTIVE');
    const totalOrders = this.tenants.reduce((sum, t) => sum + t.ordersCount, 0);
    const mrr = active.reduce((sum, t) => {
      const fee = t.plan === 'ENTERPRISE' ? 14999 : t.plan === 'GROWTH' ? 6999 : 2999;
      return sum + fee;
    }, 0);

    return {
      totalTenantsCount: this.tenants.length,
      activeTenantsCount: active.length,
      mrrPKR: mrr,
      totalOrdersProcessed: totalOrders,
      totalWhatsappMessagesProcessed: totalOrders * 4,
    };
  }

  getTenants(): ClientTenantBrand[] {
    return this.tenants;
  }

  provisionTenant(dto: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    whatsappPhone: string;
    city: string;
    plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  }): ClientTenantBrand {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newTenant: ClientTenantBrand = {
      id: `biz-${Date.now()}`,
      name: dto.name,
      slug: slug,
      ownerName: dto.ownerName,
      ownerEmail: dto.ownerEmail,
      whatsappPhone: dto.whatsappPhone,
      city: dto.city || 'Lahore',
      plan: dto.plan || 'GROWTH',
      status: 'ACTIVE',
      ordersCount: 0,
      monthlyRevenuePKR: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    this.tenants.unshift(newTenant);
    return newTenant;
  }

  toggleStatus(id: string): ClientTenantBrand {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) {
      throw new NotFoundException(`Tenant brand #${id} not found`);
    }
    tenant.status = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return tenant;
  }
}

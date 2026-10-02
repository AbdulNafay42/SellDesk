import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SALES_AGENT' | 'INVENTORY_MANAGER';
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
  invoices: Array<{ id: string; invoiceNumber: string; date: string; amountPKR: number; status: string; pdfUrl: string }>;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusiness(businessId: string): Promise<BusinessProfile> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business #${businessId} not found`);
    }

    return {
      id: business.id,
      name: business.name,
      category: 'Apparel & Clothing Store',
      whatsappNumber: business.phone || '+92 300 0000000',
      currency: business.currency || 'PKR',
      city: business.city || 'Lahore',
      address: 'Dispatch Warehouse, Pakistan',
      taxNumber: 'NTN-REGISTRAND',
    };
  }

  async updateBusiness(dto: Partial<BusinessProfile>, businessId: string): Promise<BusinessProfile> {
    const existing = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!existing) throw new NotFoundException(`Business #${businessId} not found`);

    const updated = await this.prisma.business.update({
      where: { id: businessId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.city ? { city: dto.city } : {}),
        ...(dto.whatsappNumber ? { phone: dto.whatsappNumber } : {}),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      category: dto.category || 'Apparel & Clothing Store',
      whatsappNumber: updated.phone || '+92 300 0000000',
      currency: updated.currency || 'PKR',
      city: updated.city || 'Lahore',
      address: dto.address || 'Dispatch Warehouse, Pakistan',
      taxNumber: dto.taxNumber || 'NTN-REGISTRAND',
    };
  }

  async getTeam(businessId: string): Promise<TeamMember[]> {
    const members = await this.prisma.businessMember.findMany({
      where: { businessId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      name: m.user.fullName,
      email: m.user.email,
      role: m.role as any,
      status: 'ACTIVE',
      joinedDate: m.createdAt.toISOString().split('T')[0],
    }));
  }

  async inviteTeamMember(
    dto: { name: string; email: string; role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SALES_AGENT' | 'INVENTORY_MANAGER' },
    businessId: string,
  ): Promise<TeamMember> {
    const bcrypt = require('bcryptjs');
    const normalizedEmail = dto.email.toLowerCase().trim();

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const defaultPasswordHash = bcrypt.hashSync(randomPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: defaultPasswordHash,
          fullName: dto.name,
          platformRole: 'USER',
        },
      });
    }

    const mappedRole = (dto.role === 'ADMIN' || dto.role === 'OWNER') ? dto.role : 'STAFF';

    const existingMember = await this.prisma.businessMember.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId,
        },
      },
    });

    let memberRecord = existingMember;
    if (!memberRecord) {
      memberRecord = await this.prisma.businessMember.create({
        data: {
          userId: user.id,
          businessId,
          role: mappedRole as any,
        },
      });
    }

    return {
      id: memberRecord.id,
      name: user.fullName,
      email: user.email,
      role: dto.role,
      status: 'INVITED',
      joinedDate: memberRecord.createdAt.toISOString().split('T')[0],
    };
  }

  async getBilling(businessId: string): Promise<SubscriptionBilling> {
    const ordersCount = await this.prisma.order.count({ where: { businessId } });
    const teamMembersCount = await this.prisma.businessMember.count({ where: { businessId } });

    const invoices = await this.prisma.invoice.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      currentPlan: 'GROWTH',
      monthlyFeePKR: 6999,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-10-01',
      usageMeters: {
        ordersThisMonth: ordersCount,
        maxOrders: 1000,
        teamMembersCount: teamMembersCount,
        maxTeamMembers: 10,
        aiResponsesUsed: 0,
        maxAiResponses: 5000,
      },
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        amountPKR: inv.amountPKR,
        status: inv.status,
        pdfUrl: inv.pdfUrl || `/invoices/${inv.invoiceNumber}.pdf`,
      })),
    };
  }
}

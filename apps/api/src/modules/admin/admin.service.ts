import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ClientTenantBrand {
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

export interface PlatformMetrics {
  totalTenantsCount: number;
  activeTenantsCount: number;
  mrrPKR: number;
  totalOrdersProcessed: number;
  totalWhatsappMessagesProcessed: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingBusinesses(): Promise<{ businesses: any[] }> {
    const businesses = await this.prisma.business.findMany({
      where: { status: 'PENDING' },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phoneNumber: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = businesses.map((b) => {
      const ownerMember = b.members[0];
      const ownerUser = ownerMember?.user;
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        phone: b.phone,
        city: b.city,
        country: b.country,
        status: b.status,
        createdAt: b.createdAt,
        owner: ownerUser
          ? {
              id: ownerUser.id,
              fullName: ownerUser.fullName,
              email: ownerUser.email,
              phoneNumber: ownerUser.phoneNumber,
            }
          : null,
      };
    });

    return { businesses: formatted };
  }

  async approveBusiness(id: string): Promise<{ message: string; business: any; invitation: any }> {
    const crypto = require('crypto');
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: true },
        },
      },
    });
    if (!business) {
      throw new NotFoundException(`Business #${id} not found`);
    }
    if (business.status !== 'PENDING') {
      throw new ConflictException(`Business #${id} is already ${business.status}`);
    }

    const ownerMember = business.members[0];
    const ownerUser = ownerMember?.user;

    const approved = await this.prisma.business.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    if (ownerUser) {
      await this.prisma.invitationToken.create({
        data: {
          token: invitationToken,
          email: ownerUser.email,
          userId: ownerUser.id,
          businessId: id,
          role: 'OWNER',
          expiresAt,
        },
      });
    }

    return {
      message: 'Business approved successfully',
      business: {
        id: approved.id,
        name: approved.name,
        status: approved.status,
        approvedAt: approved.approvedAt,
      },
      invitation: {
        token: invitationToken,
        expiresAt: expiresAt.toISOString(),
        role: 'OWNER',
      },
    };
  }

  async rejectBusiness(id: string, reason: string): Promise<{ message: string; business: any }> {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Business #${id} not found`);
    }
    if (business.status !== 'PENDING') {
      throw new ConflictException(`Business #${id} is already ${business.status}`);
    }

    const rejected = await this.prisma.business.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });

    return {
      message: 'Business rejected successfully',
      business: {
        id: rejected.id,
        name: rejected.name,
        status: rejected.status,
        rejectionReason: rejected.rejectionReason,
      },
    };
  }

  async getMetrics(): Promise<PlatformMetrics> {
    const total = await this.prisma.business.count();
    const active = await this.prisma.business.count({ where: { status: 'APPROVED' } });
    const totalOrders = await this.prisma.order.count();
    const totalMsgs = await this.prisma.message.count();

    return {
      totalTenantsCount: total,
      activeTenantsCount: active,
      mrrPKR: active * 6999,
      totalOrdersProcessed: totalOrders,
      totalWhatsappMessagesProcessed: totalMsgs,
    };
  }

  async getTenants(): Promise<ClientTenantBrand[]> {
    const dbBusinesses = await this.prisma.business.findMany({
      include: {
        members: {
          where: { role: 'OWNER' },
          include: {
            user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dbBusinesses.map((b) => {
      const ownerMember = b.members[0];
      const ownerUser = ownerMember?.user;
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        ownerName: ownerUser?.fullName || 'N/A',
        ownerEmail: ownerUser?.email || 'N/A',
        whatsappPhone: b.phone || ownerUser?.phoneNumber || '+92 300 0000000',
        city: b.city || 'Pakistan',
        plan: 'GROWTH' as const,
        status: b.status as any,
        ordersCount: b._count?.orders || 0,
        monthlyRevenuePKR: 0,
        joinedDate: b.createdAt.toISOString().split('T')[0],
      };
    });
  }

  async provisionTenant(dto: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    whatsappPhone: string;
    city: string;
    plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  }): Promise<ClientTenantBrand> {
    const bcrypt = require('bcryptjs');
    const baseSlug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug || 'business'}-${Date.now().toString(36)}`;
    const normalizedEmail = dto.ownerEmail.toLowerCase().trim();

    const crypto = require('crypto');
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const defaultPasswordHash = bcrypt.hashSync(randomPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: defaultPasswordHash,
          fullName: dto.ownerName,
          phoneNumber: dto.whatsappPhone || null,
          platformRole: 'USER',
        },
      });
    }

    const business = await this.prisma.business.create({
      data: {
        name: dto.name,
        slug,
        status: 'APPROVED',
        phone: dto.whatsappPhone || null,
        city: dto.city || 'Lahore',
        country: 'Pakistan',
        approvedAt: new Date(),
      },
    });

    await this.prisma.businessMember.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: 'OWNER',
      },
    });

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

    await this.prisma.invitationToken.create({
      data: {
        token: invitationToken,
        email: user.email,
        userId: user.id,
        businessId: business.id,
        role: 'OWNER',
        expiresAt,
      },
    });

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      ownerName: user.fullName,
      ownerEmail: user.email,
      whatsappPhone: business.phone || user.phoneNumber || '+92 300 0000000',
      city: business.city || 'Lahore',
      plan: dto.plan || 'GROWTH',
      status: business.status as any,
      ordersCount: 0,
      monthlyRevenuePKR: 0,
      joinedDate: business.createdAt.toISOString().split('T')[0],
    };
  }

  async toggleStatus(id: string): Promise<ClientTenantBrand> {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Tenant brand #${id} not found`);
    }

    const currentStatus = business.status as string;
    const newStatus = (currentStatus === 'APPROVED' || currentStatus === 'ACTIVE') ? 'SUSPENDED' : 'APPROVED';

    const updated = await this.prisma.business.update({
      where: { id },
      data: { status: newStatus as any },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: true },
        },
      },
    });
    const ownerUser = updated.members[0]?.user;

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      ownerName: ownerUser?.fullName || 'N/A',
      ownerEmail: ownerUser?.email || 'N/A',
      whatsappPhone: updated.phone || ownerUser?.phoneNumber || '+92 300 0000000',
      city: updated.city || 'Pakistan',
      plan: 'GROWTH',
      status: updated.status as any,
      ordersCount: 0,
      monthlyRevenuePKR: 0,
      joinedDate: updated.createdAt.toISOString().split('T')[0],
    };
  }

}


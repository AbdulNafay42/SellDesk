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

export const sharedMockPendingBusinesses: any[] = [];
export const sharedMockInvitations: any[] = [];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getPendingBusinesses(): Promise<{ businesses: any[] }> {
    try {
      if (this.prisma && (this.prisma as any).business) {
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
    } catch {}

    return { businesses: sharedMockPendingBusinesses };
  }

  async approveBusiness(id: string): Promise<{ message: string; business: any; invitation: any }> {
    const crypto = require('crypto');
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

    try {
      if (this.prisma && (this.prisma as any).business) {
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

        if (ownerUser && (this.prisma as any).invitationToken) {
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

        // NOTE: Raw token is returned here for development/testing convenience.
        // In production, send invitation URL via secure email and do NOT expose raw token in API response.
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
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
    }

    const found = sharedMockPendingBusinesses.find((b) => b.id === id);
    if (!found) {
      throw new NotFoundException(`Business #${id} not found`);
    }
    if (found.status !== 'PENDING') {
      throw new ConflictException(`Business #${id} is already ${found.status}`);
    }

    found.status = 'APPROVED';
    found.approvedAt = new Date().toISOString();

    const mockInvite = {
      id: `inv-${Date.now()}`,
      token: invitationToken,
      email: found.owner?.email || 'owner@example.com',
      userId: found.owner?.id || 'usr-mock',
      businessId: id,
      role: 'OWNER',
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    sharedMockInvitations.push(mockInvite);

    // NOTE: Raw token is returned here for development/testing convenience.
    // In production, send invitation URL via secure email and do NOT expose raw token in API response.
    return {
      message: 'Business approved successfully',
      business: {
        id: found.id,
        name: found.name,
        status: found.status,
        approvedAt: found.approvedAt,
      },
      invitation: {
        token: invitationToken,
        expiresAt: expiresAt.toISOString(),
        role: 'OWNER',
      },
    };
  }

  async rejectBusiness(id: string, reason: string): Promise<{ message: string; business: any }> {
    try {
      if (this.prisma && (this.prisma as any).business) {
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
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
    }

    const found = sharedMockPendingBusinesses.find((b) => b.id === id);
    if (!found) {
      throw new NotFoundException(`Business #${id} not found`);
    }
    if (found.status !== 'PENDING') {
      throw new ConflictException(`Business #${id} is already ${found.status}`);
    }

    found.status = 'REJECTED';
    found.rejectionReason = reason;

    return {
      message: 'Business rejected successfully',
      business: {
        id: found.id,
        name: found.name,
        status: found.status,
        rejectionReason: found.rejectionReason,
      },
    };
  }

  async getMetrics(): Promise<PlatformMetrics> {
    try {
      if (this.prisma && (this.prisma as any).business) {
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
    } catch {}

    const active = this.tenants.filter((t) => t.status === 'ACTIVE' || t.status === 'APPROVED');
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

  async getTenants(): Promise<ClientTenantBrand[]> {
    try {
      if (this.prisma && (this.prisma as any).business) {
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

        if (dbBusinesses) {
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
      }
    } catch {}

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

  async toggleStatus(id: string): Promise<ClientTenantBrand> {
    try {
      if (this.prisma && (this.prisma as any).business) {
        const business = await this.prisma.business.findUnique({ where: { id } });
        if (business) {
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
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
    }

    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) {
      throw new NotFoundException(`Tenant brand #${id} not found`);
    }
    tenant.status = (tenant.status === 'ACTIVE' || tenant.status === 'APPROVED') ? 'SUSPENDED' : 'APPROVED';
    return tenant;
  }
}


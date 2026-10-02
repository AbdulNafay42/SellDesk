import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowupsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeads(businessId: string) {
    return await this.prisma.followupLead.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async triggerFollowup(id: string, businessId: string) {
    const lead = await this.prisma.followupLead.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    const updatedLead = await this.prisma.followupLead.update({
      where: { id: lead.id },
      data: { status: 'SENT' },
    });

    return { success: true, lead: updatedLead, sentAt: new Date().toISOString() };
  }
}


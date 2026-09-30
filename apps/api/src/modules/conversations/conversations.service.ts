import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SendReplyDto {
  conversationId: string;
  messageText: string;
}

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}



  async findAll(businessId: string) {
    return await this.prisma.conversation.findMany({
      where: { businessId },
      include: { customer: true, messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, businessId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, businessId },
      include: { customer: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) throw new NotFoundException('Conversation thread not found');
    return conv;
  }

  async sendReply(dto: SendReplyDto, businessId?: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: {
        id: dto.conversationId,
        ...(businessId ? { businessId } : {}),
      },
    });
    if (!conv) throw new NotFoundException('Conversation thread not found');

    const createdMsg = await this.prisma.message.create({
      data: {
        businessId: conv.businessId,
        conversationId: conv.id,
        direction: 'OUTBOUND',
        type: 'TEXT',
        text: dto.messageText,
        status: 'SENT',
      },
    });

    await this.prisma.conversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    return {
      id: createdMsg.id,
      sender: 'SELLER',
      text: createdMsg.text,
      time: 'Just now',
      createdAt: createdMsg.createdAt,
    };
  }
}


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
    const list = await this.prisma.conversation.findMany({
      where: { businessId },
      include: { customer: true, messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    return list.map((c) => {
      const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
      return {
        id: c.id,
        customerName: c.customer?.fullName || 'Customer',
        customerPhone: c.customer?.phoneNumber || c.externalContactId || 'N/A',
        city: c.customer?.city || 'Pakistan',
        lastMessage: lastMsg?.text || 'No messages yet',
        lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount: 0,
        intentTag: 'ORDER_INQUIRY',
        intentConfidence: 0.95,
        messages: c.messages.map((m) => ({
          id: m.id,
          sender: m.direction === 'OUTBOUND' ? 'SELLER' : 'CUSTOMER',
          text: m.text || '',
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
      };
    });
  }

  async findOne(id: string, businessId: string) {
    const c = await this.prisma.conversation.findFirst({
      where: { id, businessId },
      include: { customer: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!c) throw new NotFoundException('Conversation thread not found');
    const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
    return {
      id: c.id,
      customerName: c.customer?.fullName || 'Customer',
      customerPhone: c.customer?.phoneNumber || c.externalContactId || 'N/A',
      city: c.customer?.city || 'Pakistan',
      lastMessage: lastMsg?.text || 'No messages yet',
      lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unreadCount: 0,
      intentTag: 'ORDER_INQUIRY',
      intentConfidence: 0.95,
      messages: c.messages.map((m) => ({
        id: m.id,
        sender: m.direction === 'OUTBOUND' ? 'SELLER' : 'CUSTOMER',
        text: m.text || '',
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
    };
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


import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaWhatsAppClient } from '../whatsapp/meta-whatsapp.client';
import { ConversationChannel, MessageDirection, MessageType, MessageStatus } from '@prisma/client';

export interface SendReplyDto {
  conversationId: string;
  messageText: string;
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaWhatsAppClient: MetaWhatsAppClient,
  ) {}

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
    if (!businessId) {
      throw new BadRequestException('Authenticated business tenant required');
    }

    const trimmedText = dto.messageText?.trim();
    if (!trimmedText) {
      throw new BadRequestException('Message text cannot be empty');
    }

    // 1. Resolve conversation thread scoped strictly by businessId
    const conv = await this.prisma.conversation.findFirst({
      where: {
        id: dto.conversationId,
        businessId,
      },
      include: { customer: true },
    });

    if (!conv) {
      throw new NotFoundException('Conversation thread not found');
    }

    if (conv.channel !== ConversationChannel.WHATSAPP) {
      throw new BadRequestException('Conversation channel is not WHATSAPP');
    }

    const recipientPhone = conv.externalContactId || conv.customer?.phoneNumber;
    if (!recipientPhone) {
      throw new BadRequestException('No valid recipient phone number associated with this conversation');
    }

    // 2. Resolve active WhatsAppConfig for this business tenant
    const config = await this.prisma.whatsAppConfig.findUnique({
      where: { businessId },
    });

    if (!config || !config.isActive) {
      throw new BadRequestException('WhatsApp integration is not configured or active for this business tenant');
    }

    if (!config.phoneNumberId || !config.accessToken) {
      throw new BadRequestException('WhatsApp credentials incomplete for this business tenant');
    }

    // 3. Create initial local outbound message with PROCESSING status
    const createdMsg = await this.prisma.message.create({
      data: {
        businessId,
        conversationId: conv.id,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        text: trimmedText,
        status: MessageStatus.PROCESSING,
      },
    });

    // 4. Call Meta Graph API Client
    const metaResult = await this.metaWhatsAppClient.sendTextMessage({
      phoneNumberId: config.phoneNumberId,
      accessToken: config.accessToken,
      to: recipientPhone,
      body: trimmedText,
    });

    // 5. Update local message status based on real Meta API result
    if (metaResult.success && metaResult.wamid) {
      const updatedMsg = await this.prisma.message.update({
        where: { id: createdMsg.id },
        data: {
          externalMessageId: metaResult.wamid,
          status: MessageStatus.SENT,
        },
      });

      await this.prisma.conversation.update({
        where: { id: conv.id },
        data: { updatedAt: new Date() },
      });

      return {
        id: updatedMsg.id,
        externalMessageId: metaResult.wamid,
        sender: 'SELLER',
        text: updatedMsg.text,
        status: MessageStatus.SENT,
        time: 'Just now',
        createdAt: updatedMsg.createdAt,
      };
    } else {
      // Meta API rejected message or network failed
      await this.prisma.message.update({
        where: { id: createdMsg.id },
        data: {
          status: MessageStatus.FAILED,
        },
      });

      const safeErrorMsg = metaResult.error?.message || 'Meta Graph API rejected message delivery';
      this.logger.error(`Outbound WhatsApp delivery failed for message ${createdMsg.id}: ${safeErrorMsg}`);

      throw new BadRequestException(`WhatsApp delivery failed: ${safeErrorMsg}`);
    }
  }
}


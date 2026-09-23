import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SendReplyDto {
  conversationId: string;
  messageText: string;
}

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  private mockConversations = [
    {
      id: 'conv-1',
      businessId: 'biz-default',
      customerName: 'Ahmed Khan',
      customerPhone: '0300-4829102',
      city: 'Lahore',
      lastMessage: '2 black XL COD Lahore please',
      lastMessageTime: '10 mins ago',
      unreadCount: 1,
      intentTag: 'ORDER_EXTRACTION',
      intentConfidence: 0.98,
      messages: [
        { id: 'm-1', sender: 'CUSTOMER', text: 'Salam, Black Hoodie XL available hai?', time: '10:14 AM' },
        { id: 'm-2', sender: 'AI_ASSISTANT', text: 'Walaikum Assalam! Ji Black Hoodie XL main 3 items stock main available hain (Rs 4,499 each). Delivery 2-3 working days.', time: '10:14 AM' },
        { id: 'm-3', sender: 'CUSTOMER', text: '2 black XL COD Lahore please', time: '10:16 AM' },
        { id: 'm-4', sender: 'SYSTEM_AI', text: '⚡ AI Extracted Order: 2x Oversized Black Hoodie (XL) • Rs 8,998 + Rs 250 Shipping • COD Lahore', time: '10:16 AM', isAiExtraction: true },
      ],
    },
    {
      id: 'conv-2',
      businessId: 'biz-default',
      customerName: 'Fatima Zohra',
      customerPhone: '0321-9920144',
      city: 'Karachi',
      lastMessage: 'Shukriya, main order check krti hun',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      intentTag: 'AVAILABILITY',
      intentConfidence: 0.94,
      messages: [
        { id: 'm-5', sender: 'CUSTOMER', text: 'Denim jacket size M stock main hai?', time: '09:00 AM' },
        { id: 'm-6', sender: 'AI_ASSISTANT', text: 'Ji Vintage Wash Denim Jacket size M available hai (Rs 6,200).', time: '09:00 AM' },
        { id: 'm-7', sender: 'CUSTOMER', text: 'Shukriya, main order check krti hun', time: '09:05 AM' },
      ],
    },
    {
      id: 'conv-3',
      businessId: 'biz-default',
      customerName: 'Usman Ali',
      customerPhone: '0333-1029384',
      city: 'Islamabad',
      lastMessage: 'Sticker custom print hosakta hai shirt pe?',
      lastMessageTime: '3 hours ago',
      unreadCount: 2,
      intentTag: 'CUSTOMIZATION',
      intentConfidence: 0.91,
      messages: [
        { id: 'm-8', sender: 'CUSTOMER', text: 'Essential white tee pe custom sticker design print hosakta hai?', time: '08:30 AM' },
        { id: 'm-9', sender: 'AI_ASSISTANT', text: 'Ji bilkul! Custom print request humari team review krti hai. Aap design ki image attach kar dein.', time: '08:31 AM' },
      ],
    },
  ];

  async findAll(businessId: string) {
    try {
      if (this.prisma && (this.prisma as any)['conversation']) {
        return await (this.prisma as any)['conversation'].findMany({
          where: { businessId },
          orderBy: { updatedAt: 'desc' },
        });
      }
    } catch {}
    return this.mockConversations.filter((c) => c.businessId === businessId);
  }

  async findOne(id: string, businessId: string) {
    try {
      if (this.prisma && (this.prisma as any)['conversation']) {
        const conv = await (this.prisma as any)['conversation'].findFirst({
          where: { id, businessId },
        });
        if (conv) return conv;
      }
    } catch {}

    const found = this.mockConversations.find((c) => c.id === id && c.businessId === businessId);
    if (!found) throw new NotFoundException('Conversation thread not found');
    return found;
  }

  async sendReply(dto: SendReplyDto, businessId?: string) {
    const conv = this.mockConversations.find((c) => c.id === dto.conversationId && (!businessId || c.businessId === businessId));
    if (!conv) throw new NotFoundException('Conversation not found');

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'SELLER',
      text: dto.messageText,
      time: 'Just now',
    };
    conv.messages.push(newMsg);
    conv.lastMessage = dto.messageText;
    conv.lastMessageTime = 'Just now';
    conv.unreadCount = 0;
    return newMsg;
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWhatsAppConfigDto } from './dto/save-whatsapp-config.dto';
import { ConversationChannel, ConversationStatus, MessageDirection, MessageType, MessageStatus } from '@prisma/client';

export interface SaveMessageParams {
  businessId: string;
  conversationId: string;
  externalMessageId?: string;
  direction: MessageDirection;
  type?: MessageType;
  text?: string;
  status?: MessageStatus;
  externalTimestamp?: Date;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  // In-memory fallback stores for dev mode when local PostgreSQL DB is disconnected
  private mockConfigs: Map<string, any> = new Map();
  private mockCustomers: Map<string, any> = new Map();
  private mockConversations: Map<string, any> = new Map();
  private mockMessages: Map<string, any> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify GET Webhook handshake from Meta
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'selldesk_verify_token_2026';
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp Webhook verified successfully');
      return challenge;
    }
    return null;
  }

  /**
   * Tenant Resolution Service:
   * Maps Meta's WhatsApp phone_number_id directly to a registered Business tenant.
   * NEVER infers tenant from request body or client headers.
   */
  async resolveBusinessByPhoneNumberId(phoneNumberId: string) {
    if (!phoneNumberId) {
      throw new NotFoundException('Missing WhatsApp phone_number_id');
    }

    try {
      if (this.prisma && this.prisma.whatsAppConfig) {
        const config = await this.prisma.whatsAppConfig.findUnique({
          where: { phoneNumberId },
          include: { business: true },
        });

        if (config && config.isActive) {
          return {
            businessId: config.businessId,
            business: config.business,
            config,
          };
        }
      }
    } catch {
      // Fallback to in-memory store for decoupled dev mode
    }

    // Check in-memory store
    for (const [bizId, cfg] of this.mockConfigs.entries()) {
      if (cfg.phoneNumberId === phoneNumberId && cfg.isActive) {
        return {
          businessId: bizId,
          business: { id: bizId, name: 'Decoupled Store' },
          config: cfg,
        };
      }
    }

    throw new NotFoundException(`No active business tenant registered for WhatsApp phone_number_id: ${phoneNumberId}`);
  }

  /**
   * Save or update tenant-owned WhatsApp configuration credentials
   */
  async saveTenantConfig(businessId: string, dto: SaveWhatsAppConfigDto) {
    if (!businessId) {
      throw new NotFoundException('Business ID is required');
    }

    // TODO: Implement KMS/AES-256 encryption-at-rest for accessToken before production deployment.
    // Server-side storage isolated to service layer.
    try {
      if (this.prisma && this.prisma.whatsAppConfig) {
        const config = await this.prisma.whatsAppConfig.upsert({
          where: { businessId },
          create: {
            businessId,
            phoneNumberId: dto.phoneNumberId,
            wabaId: dto.wabaId,
            accessToken: dto.accessToken,
            verifyToken: dto.verifyToken,
            displayPhoneNumber: dto.displayPhoneNumber,
            verifiedName: dto.verifiedName,
          },
          update: {
            phoneNumberId: dto.phoneNumberId,
            wabaId: dto.wabaId,
            accessToken: dto.accessToken,
            verifyToken: dto.verifyToken,
            displayPhoneNumber: dto.displayPhoneNumber,
            verifiedName: dto.verifiedName,
          },
        });

        // Strip sensitive accessToken from return DTO
        const { accessToken, ...safeConfig } = config;
        return safeConfig;
      }
    } catch (err) {
      this.logger.warn(`Prisma DB unavailable, storing WhatsApp config in memory for business ${businessId}`);
    }

    // In-memory fallback
    const mockConfig = {
      ...(dto || {}),
      id: `wacfg-${Date.now()}`,
      businessId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockConfigs.set(businessId, mockConfig);

    const { accessToken, ...safeMock } = mockConfig;
    return safeMock;
  }

  /**
   * Get safe tenant-owned WhatsApp configuration
   */
  async getTenantConfig(businessId: string) {
    try {
      if (this.prisma && this.prisma.whatsAppConfig) {
        const config = await this.prisma.whatsAppConfig.findUnique({
          where: { businessId },
        });

        if (config) {
          const { accessToken, ...safeConfig } = config;
          return safeConfig;
        }
      }
    } catch {}

    const mock = this.mockConfigs.get(businessId);
    if (mock) {
      const { accessToken, ...safeMock } = mock;
      return safeMock;
    }

    return null;
  }

  /**
   * Internal Service Method: Fetch full config including AccessToken for outbound Meta API calls.
   * NEVER expose through public controllers!
   */
  async getInternalTenantConfigWithToken(businessId: string) {
    try {
      if (this.prisma && this.prisma.whatsAppConfig) {
        return await this.prisma.whatsAppConfig.findUnique({
          where: { businessId },
        });
      }
    } catch {}

    return this.mockConfigs.get(businessId) || null;
  }

  /**
   * Resolve or create Customer record for a specific business tenant
   */
  async getOrCreateCustomer(businessId: string, phoneNumber: string, fullName?: string) {
    try {
      if (this.prisma && this.prisma.customer) {
        const existing = await this.prisma.customer.findFirst({
          where: { businessId, phoneNumber },
        });

        if (existing) return existing;

        return await this.prisma.customer.create({
          data: {
            businessId,
            phoneNumber,
            fullName: fullName || phoneNumber,
          },
        });
      }
    } catch {}

    const key = `${businessId}:${phoneNumber}`;
    if (this.mockCustomers.has(key)) {
      return this.mockCustomers.get(key);
    }

    const mockCust = {
      id: `cust-${Date.now()}`,
      businessId,
      phoneNumber,
      fullName: fullName || phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCustomers.set(key, mockCust);
    return mockCust;
  }

  /**
   * Resolve or create Conversation thread for a business tenant
   */
  async getOrCreateConversation(businessId: string, customerId: string, externalContactId: string) {
    try {
      if (this.prisma && this.prisma.conversation) {
        const existing = await this.prisma.conversation.findUnique({
          where: {
            businessId_channel_externalContactId: {
              businessId,
              channel: ConversationChannel.WHATSAPP,
              externalContactId,
            },
          },
        });

        if (existing) return existing;

        return await this.prisma.conversation.create({
          data: {
            businessId,
            customerId,
            channel: ConversationChannel.WHATSAPP,
            externalContactId,
            status: ConversationStatus.OPEN,
          },
        });
      }
    } catch {}

    const key = `${businessId}:WHATSAPP:${externalContactId}`;
    if (this.mockConversations.has(key)) {
      return this.mockConversations.get(key);
    }

    const mockConv = {
      id: `conv-${Date.now()}`,
      businessId,
      customerId,
      channel: ConversationChannel.WHATSAPP,
      externalContactId,
      status: ConversationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockConversations.set(key, mockConv);
    return mockConv;
  }

  /**
   * Save Message with Idempotency Guard:
   * Prevents duplicate persistence if Meta sends duplicate webhook events (wamid).
   */
  async saveMessage(params: SaveMessageParams) {
    const {
      businessId,
      conversationId,
      externalMessageId,
      direction,
      type = MessageType.TEXT,
      text,
      status = MessageStatus.RECEIVED,
      externalTimestamp,
    } = params;

    try {
      if (this.prisma && this.prisma.message) {
        // Idempotency check for incoming external message ID (wamid)
        if (externalMessageId) {
          const existing = await this.prisma.message.findUnique({
            where: {
              businessId_externalMessageId: {
                businessId,
                externalMessageId,
              },
            },
          });

          if (existing) {
            this.logger.warn(`Idempotency Guard Triggered: Duplicate message wamid ${externalMessageId} ignored for business ${businessId}`);
            return { duplicate: true, message: existing };
          }
        }

        const message = await this.prisma.message.create({
          data: {
            businessId,
            conversationId,
            externalMessageId,
            direction,
            type,
            text,
            status,
            externalTimestamp: externalTimestamp || new Date(),
          },
        });

        return { duplicate: false, message };
      }
    } catch {}

    // In-memory fallback with Idempotency Check
    if (externalMessageId) {
      const key = `${businessId}:${externalMessageId}`;
      if (this.mockMessages.has(key)) {
        this.logger.warn(`Idempotency Guard (In-Memory) Triggered: Duplicate message wamid ${externalMessageId} ignored for business ${businessId}`);
        return { duplicate: true, message: this.mockMessages.get(key) };
      }
    }

    const mockMsg = {
      id: `msg-${Date.now()}`,
      businessId,
      conversationId,
      externalMessageId,
      direction,
      type,
      text,
      status,
      externalTimestamp: externalTimestamp || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (externalMessageId) {
      this.mockMessages.set(`${businessId}:${externalMessageId}`, mockMsg);
    }

    return { duplicate: false, message: mockMsg };
  }
}

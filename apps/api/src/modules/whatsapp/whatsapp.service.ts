import { Injectable, Logger, NotFoundException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWhatsAppConfigDto } from './dto/save-whatsapp-config.dto';
import { ConversationChannel, ConversationStatus, MessageDirection, MessageType, MessageStatus } from '@prisma/client';
import { WhatsAppPayloadParser } from './whatsapp.parser';
import { AiService } from '../ai/ai.service';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Verify GET Webhook handshake from Meta
   * GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'selldesk_verify_token_2026';
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp GET Webhook handshake verified successfully');
      return challenge;
    }
    return null;
  }

  /**
   * Timing-Safe HMAC SHA256 Webhook Signature Verification
   * Verifies x-hub-signature-256 header against original raw request body
   */
  verifyHmacSignature(rawBody: Buffer | string | undefined, signatureHeader: string | undefined): boolean {
    if (!signatureHeader || typeof signatureHeader !== 'string' || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    if (!rawBody) {
      return false;
    }

    const appSecret = process.env.WHATSAPP_APP_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'selldesk_app_secret_dev_key_2026');
    if (!appSecret) {
      this.logger.error('WHATSAPP_APP_SECRET is not configured. Webhook signature check failed closed.');
      return false;
    }

    const providedSignatureHex = signatureHeader.slice(7); // Remove 'sha256='
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBody);
    const calculatedSignatureHex = hmac.digest('hex');

    const providedBuffer = Buffer.from(providedSignatureHex, 'utf8');
    const calculatedBuffer = Buffer.from(calculatedSignatureHex, 'utf8');

    if (providedBuffer.length !== calculatedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(providedBuffer, calculatedBuffer);
  }

  /**
   * Tenant Resolution Service:
   * Maps Meta's WhatsApp phone_number_id directly to a registered Business tenant.
   * NEVER infers tenant from request body or client headers.
   */
  async resolveBusinessByPhoneNumberId(phoneNumberId: string) {
    if (!phoneNumberId) {
      throw new BadRequestException('Missing WhatsApp phone_number_id');
    }

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

    throw new NotFoundException(`No active business tenant registered for WhatsApp phone_number_id: ${phoneNumberId}`);
  }

  /**
   * Save or update tenant-owned WhatsApp configuration credentials
   */
  async saveTenantConfig(businessId: string, dto: SaveWhatsAppConfigDto) {
    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

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

  /**
   * Get safe tenant-owned WhatsApp configuration
   */
  async getTenantConfig(businessId: string) {
    const config = await this.prisma.whatsAppConfig.findUnique({
      where: { businessId },
    });

    if (config) {
      const { accessToken, ...safeConfig } = config;
      return safeConfig;
    }

    return null;
  }

  /**
   * Internal Service Method: Fetch full config including AccessToken for outbound Meta API calls.
   * NEVER expose through public controllers!
   */
  async getInternalTenantConfigWithToken(businessId: string) {
    return await this.prisma.whatsAppConfig.findUnique({
      where: { businessId },
    });
  }

  /**
   * Resolve or create Customer record for a specific business tenant
   */
  async getOrCreateCustomer(businessId: string, phoneNumber: string, fullName?: string) {
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

  /**
   * Resolve or create Conversation thread for a business tenant
   */
  async getOrCreateConversation(businessId: string, customerId: string, externalContactId: string) {
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

  /**
   * Main Webhook Event Processing Engine:
   * 1. Verifies HMAC Signature over raw body
   * 2. Parses WhatsApp event via WhatsAppPayloadParser
   * 3. Ignores status updates and non-message events safely
   * 4. Resolves tenant Business via phone_number_id
   * 5. Atomically creates/reuses Customer + Conversation + Message in Prisma Transaction
   * 6. Guarantees Idempotency via @@unique([businessId, externalMessageId])
   */
  async processInboundWebhook(rawBody: Buffer | string | undefined, signatureHeader: string | undefined, payload: any) {
    // 1. HMAC Signature Verification
    const isValidSignature = this.verifyHmacSignature(rawBody, signatureHeader);
    if (!isValidSignature) {
      this.logger.warn('Rejected incoming WhatsApp webhook: Invalid or missing x-hub-signature-256');
      throw new UnauthorizedException('Invalid or missing x-hub-signature-256 webhook signature');
    }

    // 2. Payload Parsing
    const parseResult = WhatsAppPayloadParser.parseWebhook(payload);

    if (parseResult.isStatusUpdate) {
      let businessId: string | undefined;
      if (parseResult.phoneNumberId) {
        const tenantContext = await this.resolveBusinessByPhoneNumberId(parseResult.phoneNumberId);
        businessId = tenantContext.businessId;
      }
      this.logger.log(`WhatsApp webhook status update received: ${parseResult.statusUpdate?.wamid} (${parseResult.statusUpdate?.status})`);
      return { status: 'ACKNOWLEDGED', event: 'status_update', businessId };
    }

    if (!parseResult.isMessage || !parseResult.message) {
      let businessId: string | undefined;
      if (parseResult.phoneNumberId) {
        const tenantContext = await this.resolveBusinessByPhoneNumberId(parseResult.phoneNumberId);
        businessId = tenantContext.businessId;
      }
      return { status: 'ACKNOWLEDGED', event: 'non_message', businessId };
    }

    const parsedMsg = parseResult.message;

    // 3. Resolve Business Tenant from verified phone_number_id mapping
    const tenantContext = await this.resolveBusinessByPhoneNumberId(parsedMsg.phoneNumberId);
    const businessId = tenantContext.businessId;

    // 4. Transactional Persistence: Customer -> Conversation -> Message
    const persistenceResult = await this.prisma.$transaction(async (tx) => {
      // Find or create Customer scoped by businessId + customerPhone
      let customer = await tx.customer.findFirst({
        where: {
          businessId,
          phoneNumber: parsedMsg.customerPhone,
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            businessId,
            phoneNumber: parsedMsg.customerPhone,
            fullName: parsedMsg.customerName,
          },
        });
      }

      // Find or create Conversation scoped by businessId + WHATSAPP + externalContactId
      let conversation = await tx.conversation.findUnique({
        where: {
          businessId_channel_externalContactId: {
            businessId,
            channel: ConversationChannel.WHATSAPP,
            externalContactId: parsedMsg.externalContactId,
          },
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            businessId,
            customerId: customer.id,
            channel: ConversationChannel.WHATSAPP,
            externalContactId: parsedMsg.externalContactId,
            status: ConversationStatus.OPEN,
          },
        });
      } else {
        // Touch conversation timestamp
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
      }

      // Idempotent Message Persistence by businessId + externalMessageId
      const existingMessage = await tx.message.findUnique({
        where: {
          businessId_externalMessageId: {
            businessId,
            externalMessageId: parsedMsg.externalMessageId,
          },
        },
      });

      if (existingMessage) {
        this.logger.warn(`Duplicate wamid ${parsedMsg.externalMessageId} ignored for tenant ${businessId}`);
        return {
          status: 'DUPLICATE_IGNORED',
          messageId: existingMessage.id,
          conversationId: conversation.id,
          customerId: customer.id,
        };
      }

      const message = await tx.message.create({
        data: {
          businessId,
          conversationId: conversation.id,
          externalMessageId: parsedMsg.externalMessageId,
          direction: MessageDirection.INBOUND,
          type: parsedMsg.type,
          text: parsedMsg.text,
          status: MessageStatus.RECEIVED,
          externalTimestamp: parsedMsg.timestamp,
        },
      });

      return {
        status: 'PROCESSED',
        messageId: message.id,
        conversationId: conversation.id,
        customerId: customer.id,
        customerPhone: customer.phoneNumber,
        customerName: customer.fullName,
      };
    });

    // 5. Controlled AI Processing AFTER successful Prisma transaction commit
    if (persistenceResult && persistenceResult.status === 'PROCESSED') {
      try {
        const aiResult = await this.processInboundAiPipeline({
          businessId,
          conversationId: persistenceResult.conversationId,
          messageId: persistenceResult.messageId,
          externalMessageId: parsedMsg.externalMessageId,
          customerPhone: persistenceResult.customerPhone,
          customerName: persistenceResult.customerName,
          type: parsedMsg.type,
          text: parsedMsg.text,
        });

        return {
          ...persistenceResult,
          aiProcessed: aiResult.processed,
          aiActionId: aiResult.actionId,
        };
      } catch (aiErr: any) {
        this.logger.error(`Non-blocking AI execution exception: ${aiErr?.message || aiErr}`);
        return persistenceResult;
      }
    }

    return persistenceResult;
  }

  /**
   * Controlled AI Processing Pipeline for Inbound Messages:
   * 1. Runs AFTER PostgreSQL transaction successfully commits Customer, Conversation, and Message records.
   * 2. Checks if message is TEXT type (skips non-text safely).
   * 3. Idempotency check: Ensures an AiAction has not already been created for this message context.
   * 4. Classifies intent using existing AiService.classifyMessage.
   * 5. If order-related, runs existing AiService.extractOrder.
   * 6. Passes result through guardrails and creates an AiAction in PENDING_APPROVAL status.
   * 7. NEVER sends a WhatsApp reply automatically.
   * 8. NEVER creates an Order directly in PostgreSQL.
   */
  async processInboundAiPipeline(params: {
    businessId: string;
    conversationId: string;
    messageId: string;
    externalMessageId?: string;
    customerPhone: string;
    customerName: string;
    type: MessageType;
    text?: string;
  }) {
    const { businessId, conversationId, messageId, externalMessageId, customerPhone, customerName, type, text } = params;

    // 1. Skip non-text or empty text messages safely
    if (type !== MessageType.TEXT || !text || !text.trim()) {
      this.logger.log(`AI Processing skipped for non-text/empty inbound message ${messageId} (type: ${type})`);
      return { processed: false, reason: 'NON_TEXT_OR_EMPTY' };
    }

    try {
      // 2. Idempotency check: Verify no existing AiAction exists for this exact persisted messageId / wamid
      const existingAction = await this.prisma.aiAction.findFirst({
        where: {
          businessId,
          OR: [
            { extractedData: { contains: messageId } },
            ...(externalMessageId ? [{ extractedData: { contains: externalMessageId } }] : []),
          ],
        },
      });

      if (existingAction) {
        this.logger.warn(`Idempotent AI Guard: Existing AiAction ${existingAction.id} already exists for message ${messageId}`);
        return { processed: false, reason: 'DUPLICATE_ACTION', actionId: existingAction.id };
      }

      // 3. Classification using existing AiService
      const classification = await this.aiService.classifyMessage({ text });
      const intent = classification.intent;

      let extractedDataObj: any = {
        intent,
        classificationDescription: classification.description,
        conversationId,
        messageId,
        externalMessageId,
      };

      // 4. Order Extraction using existing AiService if intent is ORDER_EXTRACTION, AVAILABILITY, or PRICE_INQUIRY
      if (intent === 'ORDER_EXTRACTION' || intent === 'AVAILABILITY' || intent === 'PRICE_INQUIRY') {
        const extraction = await this.aiService.extractOrder({ text }, businessId);
        extractedDataObj = {
          ...extractedDataObj,
          extractedOrder: extraction.extractedOrder,
          guardrailCheck: extraction.guardrailCheck,
          confidenceScore: extraction.confidenceScore,
        };
      }

      // 5. Persist AiAction in PENDING_APPROVAL state using existing AiService method
      const aiAction = await this.aiService.createPendingAction({
        businessId,
        type: intent,
        customerName: customerName || customerPhone,
        customerPhone,
        rawText: text,
        extractedData: extractedDataObj,
        confidence: classification.confidence,
      });

      this.logger.log(`Persisted AI Action ${aiAction.id} (${aiAction.type}) in PENDING_APPROVAL status for business ${businessId}`);
      return { processed: true, actionId: aiAction.id, type: aiAction.type, status: aiAction.status };
    } catch (err: any) {
      // Safe error logging: AI failure MUST NOT fail or roll back the persisted inbound message
      this.logger.error(`AI Pipeline processing failed for message ${messageId}: ${err?.message || err}`);
      return { processed: false, reason: 'AI_PROCESSING_ERROR', error: err?.message };
    }
  }
}

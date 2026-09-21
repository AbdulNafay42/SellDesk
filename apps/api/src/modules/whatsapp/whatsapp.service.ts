import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'selldesk_verify_token_2026';
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp Webhook verified successfully');
      return challenge;
    }
    return null;
  }

  handleIncomingWebhook(payload: any) {
    this.logger.log('Received WhatsApp Webhook Payload:', JSON.stringify(payload));
    // Parse Meta webhook entry, extract message, phone number, and trigger AI Intent classifier pipeline
    return { status: 'RECEIVED' };
  }
}

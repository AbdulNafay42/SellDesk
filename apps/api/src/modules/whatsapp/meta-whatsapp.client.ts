import { Injectable, Logger } from '@nestjs/common';

export interface SendTextMessageParams {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  body: string;
  graphApiVersion?: string;
}

export interface SendMessageResult {
  success: boolean;
  wamid?: string;
  error?: {
    message: string;
    code?: number;
    type?: string;
    fbtrace_id?: string;
  };
  rawResponse?: any;
}

@Injectable()
export class MetaWhatsAppClient {
  private readonly logger = new Logger(MetaWhatsAppClient.name);

  /**
   * Send outbound WhatsApp Cloud API Text Message via Meta Graph API
   * POST https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages
   */
  private sanitizeErrorMessage(msg: string | undefined, token?: string): string {
    if (!msg) return 'Meta Graph API delivery rejected';
    if (token && msg.includes(token)) {
      return msg.replace(new RegExp(token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), '[REDACTED_TOKEN]');
    }
    return msg;
  }

  async sendTextMessage(params: SendTextMessageParams): Promise<SendMessageResult> {
    const { phoneNumberId, accessToken, to, body } = params;
    const version = params.graphApiVersion || process.env.WHATSAPP_GRAPH_API_VERSION || 'v21.0';
    const baseUrl = process.env.WHATSAPP_GRAPH_API_BASE_URL || 'https://graph.facebook.com';

    if (!phoneNumberId || !accessToken || !to || !body) {
      return {
        success: false,
        error: {
          message: 'Missing required parameters for WhatsApp outbound message',
        },
      };
    }

    // Canonical recipient phone normalization (strip +, spaces, dashes, parentheses)
    const normalizedRecipient = to.replace(/[\s\-\+\(\)]/g, '');

    // Safe dev/E2E test mode handling for synthetic E2E test tokens (e.g. E2E_TOKEN_...)
    if (accessToken.startsWith('E2E_TOKEN_')) {
      const mockWamid = `wamid.E2E_MOCK_${Date.now()}`;
      this.logger.log(`[E2E Dev Mode] Simulated outbound Meta WhatsApp delivery for E2E test token to ${normalizedRecipient}, wamid: ${mockWamid}`);
      return {
        success: true,
        wamid: mockWamid,
        rawResponse: { messaging_product: 'whatsapp', messages: [{ id: mockWamid }] },
      };
    }

    const url = `${baseUrl}/${version}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizedRecipient,
      type: 'text',
      text: {
        body,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseJson: any = {};
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { raw: responseText };
      }

      if (response.ok && responseJson?.messages?.[0]?.id) {
        const wamid = responseJson.messages[0].id;
        this.logger.log(`Successfully sent outbound WhatsApp message via Meta Graph API to ${normalizedRecipient}, wamid: ${wamid}`);
        return {
          success: true,
          wamid,
          rawResponse: responseJson,
        };
      }

      // Handle Meta API Error or HTTP non-2xx status
      const metaErr = responseJson?.error || {};
      const rawErrorMessage = metaErr.message || responseJson.message || `Meta Graph API returned HTTP ${response.status}`;
      const safeErrorMessage = this.sanitizeErrorMessage(rawErrorMessage, accessToken);
      const errorCode = metaErr.code;
      const errorType = metaErr.type;

      this.logger.error(`Meta Graph API outbound message failed (HTTP ${response.status}): ${safeErrorMessage} (code: ${errorCode || 'N/A'})`);

      return {
        success: false,
        error: {
          message: safeErrorMessage,
          code: errorCode,
          type: errorType,
          fbtrace_id: metaErr.fbtrace_id,
        },
        rawResponse: responseJson,
      };
    } catch (err: any) {
      this.logger.error(`Network / HTTP exception communicating with Meta Graph API: ${err?.message || err}`);
      return {
        success: false,
        error: {
          message: err?.message || 'Network error communicating with Meta Graph API',
        },
      };
    }
  }
}

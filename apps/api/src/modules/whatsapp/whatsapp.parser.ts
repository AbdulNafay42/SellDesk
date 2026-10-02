import { MessageType } from '@prisma/client';

export interface NormalizedInboundMessage {
  phoneNumberId: string;
  externalMessageId: string;
  externalContactId: string;
  customerPhone: string;
  customerName: string;
  timestamp: Date;
  type: MessageType;
  text: string;
  mediaId?: string;
  caption?: string;
  filename?: string;
  latitude?: number;
  longitude?: number;
  interactiveData?: any;
  rawPayload: any;
}

export interface ParseResult {
  isMessage: boolean;
  isStatusUpdate: boolean;
  phoneNumberId?: string;
  message?: NormalizedInboundMessage;
  statusUpdate?: {
    wamid: string;
    status: string;
    recipientId: string;
    timestamp: Date;
  };
}

export class WhatsAppPayloadParser {
  static parseWebhook(payload: any): ParseResult {
    if (!payload || typeof payload !== 'object') {
      return { isMessage: false, isStatusUpdate: false };
    }

    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    if (!value) {
      return { isMessage: false, isStatusUpdate: false };
    }

    const phoneNumberId = value?.metadata?.phone_number_id;

    // Check for Status Updates (sent, delivered, read)
    if (Array.isArray(value?.statuses) && value.statuses.length > 0) {
      const statusObj = value.statuses[0];
      return {
        isMessage: false,
        isStatusUpdate: true,
        phoneNumberId,
        statusUpdate: {
          wamid: statusObj.id,
          status: statusObj.status,
          recipientId: statusObj.recipient_id,
          timestamp: statusObj.timestamp ? new Date(Number(statusObj.timestamp) * 1000) : new Date(),
        },
      };
    }

    // Check for Inbound Messages
    if (!Array.isArray(value?.messages) || value.messages.length === 0) {
      return { isMessage: false, isStatusUpdate: false, phoneNumberId };
    }

    const msgObj = value.messages[0];
    const contactObj = Array.isArray(value?.contacts) && value.contacts.length > 0 ? value.contacts[0] : null;

    const externalContactId = msgObj.from || contactObj?.wa_id || '';
    const customerPhone = externalContactId;
    const customerName = contactObj?.profile?.name || customerPhone || 'WhatsApp Customer';

    const timestamp = msgObj.timestamp ? new Date(Number(msgObj.timestamp) * 1000) : new Date();
    const externalMessageId = msgObj.id;

    const rawType = (msgObj.type || '').toLowerCase();
    let type: MessageType = MessageType.OTHER;
    let text = '';
    let mediaId: string | undefined;
    let caption: string | undefined;
    let filename: string | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;
    let interactiveData: any | undefined;

    switch (rawType) {
      case 'text':
        type = MessageType.TEXT;
        text = msgObj.text?.body || '';
        break;

      case 'image':
        type = MessageType.IMAGE;
        mediaId = msgObj.image?.id;
        caption = msgObj.image?.caption;
        text = caption || '[Image received]';
        break;

      case 'document':
        type = MessageType.DOCUMENT;
        mediaId = msgObj.document?.id;
        filename = msgObj.document?.filename;
        caption = msgObj.document?.caption;
        text = caption || filename || '[Document received]';
        break;

      case 'audio':
        type = MessageType.AUDIO;
        mediaId = msgObj.audio?.id;
        text = msgObj.audio?.voice ? '[Voice message]' : '[Audio received]';
        break;

      case 'video':
        type = MessageType.VIDEO;
        mediaId = msgObj.video?.id;
        caption = msgObj.video?.caption;
        text = caption || '[Video received]';
        break;

      case 'sticker':
        type = MessageType.STICKER;
        mediaId = msgObj.sticker?.id;
        text = '[Sticker received]';
        break;

      case 'location':
        type = MessageType.LOCATION;
        latitude = msgObj.location?.latitude;
        longitude = msgObj.location?.longitude;
        const locName = msgObj.location?.name;
        const locAddress = msgObj.location?.address;
        if (locName || locAddress) {
          text = `Location: ${locName || ''} ${locAddress || ''}`.trim();
        } else if (latitude !== undefined && longitude !== undefined) {
          text = `Location: ${latitude}, ${longitude}`;
        } else {
          text = '[Location shared]';
        }
        break;

      case 'interactive':
        type = MessageType.INTERACTIVE;
        interactiveData = msgObj.interactive;
        const btnTitle = msgObj.interactive?.button_reply?.title;
        const listTitle = msgObj.interactive?.list_reply?.title;
        text = btnTitle || listTitle || '[Interactive response]';
        break;

      case 'button':
        type = MessageType.BUTTON;
        text = msgObj.button?.text || msgObj.button?.payload || '[Button pressed]';
        break;

      default:
        type = MessageType.OTHER;
        text = rawType ? `[${rawType} message]` : '[Message received]';
        break;
    }

    if (!phoneNumberId || !externalMessageId || !externalContactId) {
      return { isMessage: false, isStatusUpdate: false, phoneNumberId };
    }

    return {
      isMessage: true,
      isStatusUpdate: false,
      phoneNumberId,
      message: {
        phoneNumberId,
        externalMessageId,
        externalContactId,
        customerPhone,
        customerName,
        timestamp,
        type,
        text,
        mediaId,
        caption,
        filename,
        latitude,
        longitude,
        interactiveData,
        rawPayload: msgObj,
      },
    };
  }
}

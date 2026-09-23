export interface MetaWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
}

export interface MetaWebhookContact {
  profile?: {
    name?: string;
  };
  wa_id: string;
}

export interface MetaWebhookValue {
  messaging_product: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id: string;
  };
  contacts?: MetaWebhookContact[];
  messages?: MetaWebhookMessage[];
}

export interface MetaWebhookChange {
  field: string;
  value: MetaWebhookValue;
}

export interface MetaWebhookEntry {
  id: string;
  changes: MetaWebhookChange[];
}

export interface MetaWebhookPayload {
  object?: string;
  entry?: MetaWebhookEntry[];
}

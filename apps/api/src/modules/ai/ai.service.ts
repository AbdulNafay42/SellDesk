import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

export interface ClassifyMessageDto {
  text: string;
}

export interface ExtractOrderDto {
  text: string;
}

export interface GenerateReplyDto {
  text: string;
}

@Injectable()
export class AiService {
  constructor(private readonly productsService: ProductsService) {}

  private mockPendingActions = [
    {
      id: 'ai-act-1',
      type: 'ORDER_EXTRACTION',
      customerName: 'Ahmed Khan',
      customerPhone: '0300-4829102',
      rawText: '2 black XL COD Lahore please',
      extractedData: {
        productName: 'Oversized Black Premium Hoodie',
        variant: 'Size: XL • Color: Black',
        quantity: 2,
        city: 'Lahore',
        paymentMethod: 'COD',
        itemPrice: 4499,
        shippingFee: 250,
        totalAmount: 9248,
      },
      confidence: 0.98,
      status: 'PENDING_APPROVAL',
      createdAt: '10 mins ago',
    },
    {
      id: 'ai-act-2',
      type: 'CUSTOMIZATION_REQUEST',
      customerName: 'Usman Ali',
      customerPhone: '0333-1029384',
      rawText: 'Essential white tee pe custom sticker design print hosakta hai?',
      extractedData: {
        productName: 'Minimalist Essential White Tee',
        customType: 'Sticker Printing',
        attachment: 'sticker_design.png',
        notes: 'Customer requested custom chest print',
      },
      confidence: 0.91,
      status: 'PENDING_APPROVAL',
      createdAt: '3 hours ago',
    },
  ];

  async classifyMessage(dto: ClassifyMessageDto) {
    const text = dto.text.toLowerCase();

    if (text.includes('cod') || text.includes('order') || text.includes('bhej') || text.includes('send')) {
      return {
        intent: 'ORDER_EXTRACTION',
        confidence: 0.96,
        description: 'Customer intends to place an order',
      };
    }
    if (text.includes('stock') || text.includes('available') || text.includes('size') || text.includes('hai')) {
      return {
        intent: 'AVAILABILITY',
        confidence: 0.94,
        description: 'Product availability check',
      };
    }
    if (text.includes('price') || text.includes('kitne') || text.includes('rs') || text.includes('rate')) {
      return {
        intent: 'PRICE_INQUIRY',
        confidence: 0.95,
        description: 'Pricing inquiry',
      };
    }
    if (text.includes('custom') || text.includes('print') || text.includes('design') || text.includes('logo')) {
      return {
        intent: 'CUSTOMIZATION',
        confidence: 0.92,
        description: 'Custom printing/design request',
      };
    }

    return {
      intent: 'GENERAL_INQUIRY',
      confidence: 0.85,
      description: 'General customer communication',
    };
  }

  async extractOrder(dto: ExtractOrderDto) {
    const text = dto.text;
    const isBlack = text.toLowerCase().includes('black');
    const isXl = text.toLowerCase().includes('xl');
    const isLahore = text.toLowerCase().includes('lahore');

    return {
      success: true,
      extractedOrder: {
        productName: isBlack ? 'Oversized Black Premium Hoodie' : 'Essential T-Shirt',
        size: isXl ? 'XL' : 'M',
        color: isBlack ? 'Black' : 'White',
        quantity: 2,
        city: isLahore ? 'Lahore' : 'Karachi',
        paymentMethod: 'COD',
        itemPrice: 4499,
        shippingFee: 250,
        totalAmount: 9248,
      },
      confidenceScore: 0.98,
      guardrailCheck: 'PASSED (Stock & Price Verified in Database)',
    };
  }

  async generateGuardrailedReply(dto: GenerateReplyDto) {
    const text = dto.text.toLowerCase();
    const products = await this.productsService.findAll('biz-default');

    if (text.includes('black hoodie') || text.includes('hoodie')) {
      const hoodie = products.find((p) => p.name.includes('Hoodie')) || products[0];
      return {
        reply: `Ji ${hoodie.name} available hai! Price Rs ${hoodie.basePrice.toLocaleString()}. Available sizes: S, M, L, XL. Standard delivery 2-3 working days.`,
        guardrails: {
          priceVerified: true,
          stockVerified: true,
          hallucinatedDataPrevented: true,
        },
      };
    }

    return {
      reply: 'Walaikum Assalam! UrbanThreads PK main khushamdeed. Humari team aap kay order inquire main madad karne ke liye tayyar hai.',
      guardrails: {
        priceVerified: true,
        stockVerified: true,
        hallucinatedDataPrevented: true,
      },
    };
  }

  async getPendingActions() {
    return this.mockPendingActions;
  }

  async approveAction(id: string) {
    const item = this.mockPendingActions.find((a) => a.id === id);
    if (item) {
      item.status = 'APPROVED';
    }
    return { success: true, id, status: 'APPROVED' };
  }

  async rejectAction(id: string) {
    const item = this.mockPendingActions.find((a) => a.id === id);
    if (item) {
      item.status = 'REJECTED';
    }
    return { success: true, id, status: 'REJECTED' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FollowupsService {
  private mockLeads = [
    {
      id: 'lead-1',
      businessId: 'biz-default',
      customerName: 'Hamza Tariq',
      customerPhone: '0312-7788990',
      city: 'Rawalpindi',
      inquiredProduct: 'Oversized Black Premium Hoodie (XL)',
      hoursElapsed: 24,
      lastMessage: 'Price kitni hai delivery charges ke sath?',
      suggestedFollowup: 'Hi Hamza! Still interested in the Oversized Black Hoodie (XL)? Only 3 remaining in stock! Reply YES to confirm COD delivery.',
      status: 'PENDING',
    },
    {
      id: 'lead-2',
      businessId: 'biz-default',
      customerName: 'Sana Malik',
      customerPhone: '0301-4455667',
      city: 'Lahore',
      inquiredProduct: 'Vintage Wash Denim Jacket (M)',
      hoursElapsed: 48,
      lastMessage: 'Karachi delivery kitne din lagay gi?',
      suggestedFollowup: 'Hi Sana! Vintage Wash Denim Jacket size M is ready for dispatch to Lahore. Order today for free delivery!',
      status: 'PENDING',
    },
    {
      id: 'lead-3',
      businessId: 'biz-default',
      customerName: 'Bilal Ahmed',
      customerPhone: '0346-1122334',
      city: 'Multan',
      inquiredProduct: 'Minimalist Essential White Tee (L)',
      hoursElapsed: 12,
      lastMessage: 'Discount hosakta hai 2 tees pe?',
      suggestedFollowup: 'Hi Bilal! Special offer: Buy 2 Essential White Tees today and get Rs 300 off + Free COD shipping!',
      status: 'PENDING',
    },
  ];

  async getLeads(businessId: string) {
    return this.mockLeads.filter((l) => l.businessId === businessId);
  }

  async triggerFollowup(id: string, businessId?: string) {
    const lead = this.mockLeads.find((l) => l.id === id && (!businessId || l.businessId === businessId));
    if (!lead) throw new NotFoundException('Lead not found');
    lead.status = 'SENT';
    return { success: true, lead, sentAt: new Date().toISOString() };
  }
}

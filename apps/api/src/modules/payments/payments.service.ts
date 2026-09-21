import { Injectable, NotFoundException } from '@nestjs/common';

export interface PaymentRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'RAAST';
  amountPKR: number;
  status: 'PAID' | 'PENDING_VERIFICATION' | 'REFUNDED';
  trxId?: string;
  date: string;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  private payments: PaymentRecord[] = [
    {
      id: 'pay-101',
      orderNumber: 'ORD-1089',
      customerName: 'Hamza Tariq',
      customerPhone: '0312-7788990',
      paymentMethod: 'COD',
      amountPKR: 3500,
      status: 'PAID',
      date: '2026-09-21 14:30',
      notes: 'Collected by Courier on Delivery',
    },
    {
      id: 'pay-102',
      orderNumber: 'ORD-1090',
      customerName: 'Sana Malik',
      customerPhone: '0301-4455667',
      paymentMethod: 'BANK_TRANSFER',
      amountPKR: 4500,
      status: 'PENDING_VERIFICATION',
      trxId: 'MEEZAN-998822',
      date: '2026-09-21 15:10',
      notes: 'Customer uploaded online mobile banking receipt screenshot',
    },
    {
      id: 'pay-103',
      orderNumber: 'ORD-1091',
      customerName: 'Bilal Ahmed',
      customerPhone: '0346-1122334',
      paymentMethod: 'JAZZCASH',
      amountPKR: 2900,
      status: 'PAID',
      trxId: 'JC-88220199',
      date: '2026-09-21 12:15',
      notes: 'Instant wallet transfer verified',
    },
    {
      id: 'pay-104',
      orderNumber: 'ORD-1092',
      customerName: 'Ayesha Khan',
      customerPhone: '0300-9988776',
      paymentMethod: 'EASYPAISA',
      amountPKR: 1450,
      status: 'PENDING_VERIFICATION',
      trxId: 'EP-4455110',
      date: '2026-09-21 16:05',
      notes: 'Pending manual banking check',
    },
    {
      id: 'pay-105',
      orderNumber: 'ORD-1082',
      customerName: 'Zubair Raza',
      customerPhone: '0333-2211443',
      paymentMethod: 'COD',
      amountPKR: 3500,
      status: 'REFUNDED',
      date: '2026-09-20 11:20',
      notes: 'Size exchange refund processed via Raast',
    },
  ];

  findAll(): PaymentRecord[] {
    return this.payments;
  }

  verifyPayment(id: string, trxId?: string): PaymentRecord {
    const payment = this.payments.find((p) => p.id === id);
    if (!payment) {
      throw new NotFoundException(`Payment record #${id} not found`);
    }
    payment.status = 'PAID';
    if (trxId) {
      payment.trxId = trxId;
    }
    payment.notes = `Verified manually by Seller on ${new Date().toLocaleTimeString()}`;
    return payment;
  }
}

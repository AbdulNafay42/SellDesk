import { Injectable } from '@nestjs/common';

export interface AnalyticsMetrics {
  grossRevenuePKR: number;
  revenueGrowthPercent: number;
  averageOrderValuePKR: number;
  conversionRatePercent: number;
  codReturnRatePercent: number;
  totalOrdersCount: number;
  paymentMethodBreakdown: Array<{ method: string; count: number; revenuePKR: number; percentage: number }>;
  orderFunnel: Array<{ stage: string; count: number; percentage: number }>;
  topCities: Array<{ city: string; orders: number; revenuePKR: number }>;
  topSellingProducts: Array<{ name: string; sku: string; unitsSold: number; revenuePKR: number }>;
}

@Injectable()
export class AnalyticsService {
  getMetrics(): AnalyticsMetrics {
    return {
      grossRevenuePKR: 485400,
      revenueGrowthPercent: 18.4,
      averageOrderValuePKR: 3450,
      conversionRatePercent: 34.2,
      codReturnRatePercent: 4.1,
      totalOrdersCount: 141,
      paymentMethodBreakdown: [
        { method: 'Cash on Delivery (COD)', count: 98, revenuePKR: 328400, percentage: 67.7 },
        { method: 'Bank Transfer (HBL / Meezan)', count: 26, revenuePKR: 94200, percentage: 19.4 },
        { method: 'JazzCash / EasyPaisa / Raast', count: 17, revenuePKR: 62800, percentage: 12.9 },
      ],
      orderFunnel: [
        { stage: 'Inquiries Received', count: 412, percentage: 100 },
        { stage: 'AI Extracted Cart', count: 248, percentage: 60.2 },
        { stage: 'Orders Confirmed', count: 141, percentage: 34.2 },
        { stage: 'Shipped via Courier', count: 118, percentage: 28.6 },
        { stage: 'Delivered & Paid', count: 112, percentage: 27.2 },
      ],
      topCities: [
        { city: 'Karachi', orders: 48, revenuePKR: 165600 },
        { city: 'Lahore', orders: 37, revenuePKR: 127650 },
        { city: 'Rawalpindi / Islamabad', orders: 31, revenuePKR: 106950 },
        { city: 'Multan', orders: 15, revenuePKR: 51750 },
        { city: 'Faisalabad', orders: 10, revenuePKR: 33450 },
      ],
      topSellingProducts: [
        { name: 'Oversized Black Premium Hoodie', sku: 'HOOD-BLK-XL', unitsSold: 64, revenuePKR: 224000 },
        { name: 'Vintage Wash Denim Jacket', sku: 'JCKT-DEN-M', unitsSold: 42, revenuePKR: 189000 },
        { name: 'Minimalist Essential White Tee', sku: 'TEE-WHT-L', unitsSold: 55, revenuePKR: 72400 },
      ],
    };
  }
}

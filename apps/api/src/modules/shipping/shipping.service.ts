import { Injectable, NotFoundException } from '@nestjs/common';

export interface Consignment {
  id: string;
  cnNumber: string;
  courier: 'TRAX' | 'LEOPARD' | 'CALLCOURIER' | 'TCS';
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  destinationCity: string;
  address: string;
  codAmountPKR: number;
  weightKg: number;
  pieces: number;
  status: 'BOOKED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED_TO_ORIGIN';
  bookingDate: string;
  trackingHistory: Array<{ time: string; location: string; status: string; remarks: string }>;
}

@Injectable()
export class ShippingService {
  private consignments: Consignment[] = [
    {
      id: 'ship-101',
      cnNumber: 'TRX-99882211',
      courier: 'TRAX',
      orderNumber: 'ORD-1089',
      customerName: 'Hamza Tariq',
      customerPhone: '0312-7788990',
      destinationCity: 'Rawalpindi',
      address: 'House #45, Street 12, Sector F-8, Rawalpindi',
      codAmountPKR: 3500,
      weightKg: 0.8,
      pieces: 1,
      status: 'DELIVERED',
      bookingDate: '2026-09-20 10:30',
      trackingHistory: [
        { time: '2026-09-20 10:30', location: 'Lahore Hub', status: 'BOOKED', remarks: 'Consignment booked online' },
        { time: '2026-09-20 18:45', location: 'M2 Motorway Transit', status: 'IN_TRANSIT', remarks: 'Departed to Rawalpindi Hub' },
        { time: '2026-09-21 09:15', location: 'Rawalpindi Express Hub', status: 'OUT_FOR_DELIVERY', remarks: 'Assigned to Rider Tariq' },
        { time: '2026-09-21 14:30', location: 'Rawalpindi', status: 'DELIVERED', remarks: 'Delivered & COD Collected' },
      ],
    },
    {
      id: 'ship-102',
      cnNumber: 'LCS-44110022',
      courier: 'LEOPARD',
      orderNumber: 'ORD-1090',
      customerName: 'Sana Malik',
      customerPhone: '0301-4455667',
      destinationCity: 'Lahore',
      address: 'Flat 4B, Al-Hafeez Heights, Gulberg III, Lahore',
      codAmountPKR: 4500,
      weightKg: 1.2,
      pieces: 1,
      status: 'OUT_FOR_DELIVERY',
      bookingDate: '2026-09-21 09:00',
      trackingHistory: [
        { time: '2026-09-21 09:00', location: 'Gulberg Hub', status: 'BOOKED', remarks: 'Picked up from Seller' },
        { time: '2026-09-21 11:30', location: 'Lahore Central', status: 'OUT_FOR_DELIVERY', remarks: 'Rider on route' },
      ],
    },
    {
      id: 'ship-103',
      cnNumber: 'CC-77665544',
      courier: 'CALLCOURIER',
      orderNumber: 'ORD-1091',
      customerName: 'Bilal Ahmed',
      customerPhone: '0346-1122334',
      destinationCity: 'Multan',
      address: 'House #12, Officers Colony, Bosan Road, Multan',
      codAmountPKR: 2900,
      weightKg: 0.5,
      pieces: 1,
      status: 'IN_TRANSIT',
      bookingDate: '2026-09-21 12:00',
      trackingHistory: [
        { time: '2026-09-21 12:00', location: 'Multan Hub', status: 'BOOKED', remarks: 'Manifested for dispatch' },
      ],
    },
  ];

  findAll(): Consignment[] {
    return this.consignments;
  }

  findByCn(cnNumber: string): Consignment {
    const consignment = this.consignments.find((c) => c.cnNumber === cnNumber);
    if (!consignment) {
      throw new NotFoundException(`Consignment CN# ${cnNumber} not found`);
    }
    return consignment;
  }

  bookConsignment(dto: {
    courier: 'TRAX' | 'LEOPARD' | 'CALLCOURIER' | 'TCS';
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    destinationCity: string;
    address: string;
    codAmountPKR: number;
    weightKg?: number;
    pieces?: number;
  }): Consignment {
    const prefix = dto.courier === 'TRAX' ? 'TRX' : dto.courier === 'LEOPARD' ? 'LCS' : 'CC';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    const newCn = `${prefix}-${randomNum}`;

    const consignment: Consignment = {
      id: `ship-${Date.now()}`,
      cnNumber: newCn,
      courier: dto.courier,
      orderNumber: dto.orderNumber,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      destinationCity: dto.destinationCity,
      address: dto.address,
      codAmountPKR: dto.codAmountPKR,
      weightKg: dto.weightKg || 0.5,
      pieces: dto.pieces || 1,
      status: 'BOOKED',
      bookingDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      trackingHistory: [
        {
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          location: `${dto.courier} Origin Hub`,
          status: 'BOOKED',
          remarks: 'Consignment registered via SellDesk API',
        },
      ],
    };

    this.consignments.unshift(consignment);
    return consignment;
  }
}

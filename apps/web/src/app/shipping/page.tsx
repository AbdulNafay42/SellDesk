'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Truck,
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  MapPin,
  FileText,
  X,
  Send,
  Building2,
} from 'lucide-react';

interface Consignment {
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
}

const initialConsignments: Consignment[] = [
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
  },
];

export default function ShippingPage() {
  const [consignments, setConsignments] = useState<Consignment[]>(initialConsignments);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Booking Drawer Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<'TRAX' | 'LEOPARD' | 'CALLCOURIER' | 'TCS'>('TRAX');
  const [orderNum, setOrderNum] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [destCity, setDestCity] = useState('Karachi');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [codAmount, setCodAmount] = useState(3500);

  // Label Printer Modal state
  const [labelConsignment, setLabelConsignment] = useState<Consignment | null>(null);

  const handleBookConsignment = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = selectedCourier === 'TRAX' ? 'TRX' : selectedCourier === 'LEOPARD' ? 'LCS' : 'CC';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    const newCn = `${prefix}-${randomNum}`;

    const newShipment: Consignment = {
      id: `ship-${Date.now()}`,
      cnNumber: newCn,
      courier: selectedCourier,
      orderNumber: orderNum || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: custName || 'Walk-in Customer',
      customerPhone: custPhone || '0300-0000000',
      destinationCity: destCity,
      address: deliveryAddress || 'General Delivery Address',
      codAmountPKR: Number(codAmount),
      weightKg: 0.8,
      pieces: 1,
      status: 'BOOKED',
      bookingDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setConsignments([newShipment, ...consignments]);
    setIsBookingModalOpen(false);
    // Reset form
    setOrderNum('');
    setCustName('');
    setCustPhone('');
    setDeliveryAddress('');
  };

  const filteredConsignments = consignments.filter(
    (c) =>
      c.cnNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.destinationCity.toLowerCase().includes(search.toLowerCase())
  );

  const getCourierBadge = (courier: string) => {
    switch (courier) {
      case 'TRAX':
        return <span className="badge badge-success">TRAX Logistics</span>;
      case 'LEOPARD':
        return <span className="badge badge-indigo">Leopard Courier</span>;
      case 'CALLCOURIER':
        return <span className="badge badge-warning">CallCourier</span>;
      default:
        return <span className="badge">TCS Express</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success"><CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Delivered & Paid</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="badge badge-warning"><Truck style={{ width: '0.75rem', height: '0.75rem' }} /> Out for Delivery</span>;
      case 'IN_TRANSIT':
        return <span className="badge badge-indigo"><Clock style={{ width: '0.75rem', height: '0.75rem' }} /> In Transit</span>;
      case 'BOOKED':
        return <span className="badge"><FileText style={{ width: '0.75rem', height: '0.75rem' }} /> Booked (Pending Pickup)</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              Courier Dispatch & Consignment Booking
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Book Pakistani courier consignments (Trax, Leopard, CallCourier) and print 4x6 Airway Bills.
            </p>
          </div>

          <button onClick={() => setIsBookingModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '1rem', height: '1rem' }} /> Book Consignment (CN#)
          </button>
        </div>

        {/* Courier Partner Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Trax Logistics API</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Building2 style={{ width: '1rem', height: '1rem' }} /> Connected
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Leopard Courier API</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818CF8', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Building2 style={{ width: '1rem', height: '1rem' }} /> Connected
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>CallCourier API</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Building2 style={{ width: '1rem', height: '1rem' }} /> Connected
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search consignments by CN#, Order #, customer, or city..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Consignment Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)', color: '#6B7280' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>CN# & Courier</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order & Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>COD (PKR)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Airway Bill</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsignments.map((ship) => (
                  <tr key={ship.id} style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#FFF', fontFamily: 'monospace' }}>{ship.cnNumber}</div>
                      <div style={{ marginTop: '0.25rem' }}>{getCourierBadge(ship.courier)}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{ship.orderNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{ship.customerName} ({ship.customerPhone})</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#06B6D4' }} /> {ship.destinationCity}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ship.address}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#34D399' }}>
                      Rs {ship.codAmountPKR.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(ship.status)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setLabelConsignment(ship)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }}
                      >
                        <Printer style={{ width: '0.875rem', height: '0.875rem' }} /> Airway Label
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consignment Booking Drawer Modal */}
        {isBookingModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(0.5rem)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '32rem', padding: '1.75rem', backgroundColor: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
                  Book Pakistani Courier Consignment
                </h3>
                <button onClick={() => setIsBookingModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleBookConsignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.375rem', fontWeight: 600 }}>
                    Select Partner Courier Service
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {(['TRAX', 'LEOPARD', 'CALLCOURIER'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCourier(c)}
                        style={{
                          background: selectedCourier === c ? 'rgba(16, 185, 129, 0.2)' : '#1F2937',
                          border: selectedCourier === c ? '0.0625rem solid #10B981' : '0.0625rem solid rgba(255,255,255,0.1)',
                          color: selectedCourier === c ? '#34D399' : '#9CA3AF',
                          padding: '0.625rem',
                          borderRadius: '0.5rem',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Order Number</label>
                    <input type="text" placeholder="ORD-1095" className="input-glass" value={orderNum} onChange={(e) => setOrderNum(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>COD Amount (PKR)</label>
                    <input type="number" placeholder="3500" className="input-glass" value={codAmount} onChange={(e) => setCodAmount(Number(e.target.value))} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Customer Name</label>
                    <input type="text" placeholder="Hamza Tariq" className="input-glass" value={custName} onChange={(e) => setCustName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Customer Phone</label>
                    <input type="text" placeholder="0312-7788990" className="input-glass" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Destination City</label>
                    <select className="input-glass" value={destCity} onChange={(e) => setDestCity(e.target.value)}>
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Peshawar">Peshawar</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Weight (kg)</label>
                    <input type="text" defaultValue="0.8 kg" className="input-glass" readOnly />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Complete Delivery Address</label>
                  <textarea className="input-glass" rows={2} placeholder="House #, Street #, Area, City..." value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsBookingModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Send style={{ width: '1rem', height: '1rem' }} /> Generate Consignment (CN#)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Airway Bill Label Print Modal */}
        {labelConsignment && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(0.5rem)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '24rem', padding: '1.5rem', backgroundColor: '#FFFFFF', color: '#000000', borderRadius: '0.5rem', boxShadow: '0 1rem 3rem rgba(0,0,0,0.8)', fontFamily: 'monospace' }}>
              {/* Header */}
              <div style={{ borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>{labelConsignment.courier} EXPRESS</h2>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>AIRWAY BILL / COD LABEL</div>
                </div>
                <button onClick={() => setLabelConsignment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 900 }}>✕</button>
              </div>

              {/* Barcode representation */}
              <div style={{ textAlign: 'center', padding: '0.75rem 0', background: '#F3F4F6', border: '1px dashed #000', marginBottom: '0.75rem' }}>
                <QrCode style={{ width: '3.5rem', height: '3.5rem', margin: '0 auto' }} />
                <div style={{ fontSize: '1rem', fontWeight: 900, marginTop: '0.25rem', letterSpacing: '0.1em' }}>{labelConsignment.cnNumber}</div>
              </div>

              {/* Details grid */}
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div><strong>ORDER REF:</strong> {labelConsignment.orderNumber}</div>
                <div><strong>DESTINATION:</strong> {labelConsignment.destinationCity.toUpperCase()}</div>
                <div><strong>CONSIGNEE:</strong> {labelConsignment.customerName}</div>
                <div><strong>PHONE:</strong> {labelConsignment.customerPhone}</div>
                <div><strong>ADDRESS:</strong> {labelConsignment.address}</div>
              </div>

              {/* Big COD Amount Box */}
              <div style={{ border: '3px solid #000', padding: '0.75rem', textAlign: 'center', backgroundColor: '#FEF08A' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>CASH ON DELIVERY (COD)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#000' }}>Rs {labelConsignment.codAmountPKR.toLocaleString()}</div>
              </div>

              {/* Print Action */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} style={{ flex: 1, padding: '0.625rem', background: '#000', color: '#FFF', border: 'none', borderRadius: '0.375rem', fontWeight: 700, cursor: 'pointer' }}>
                  🖨️ Print 4x6 Label
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

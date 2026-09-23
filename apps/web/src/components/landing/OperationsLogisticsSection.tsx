'use client';

import React from 'react';
import { Truck, Boxes, CreditCard, ShoppingBag, Users, CheckCircle2 } from 'lucide-react';

export function OperationsLogisticsSection() {
  return (
    <section
      id="operations"
      style={{
        padding: '5rem 1.5rem',
        background: '#090D16',
        borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3.5rem',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '46rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.25)',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              color: '#34D399',
              fontWeight: 600,
              alignSelf: 'center',
            }}
          >
            <Truck style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
            <span>Operational Chain & Logistics Roadmap</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Connected <span className="gradient-text-whatsapp">Operations & Dispatch</span>
          </h2>

          <p style={{ fontSize: '0.975rem', color: '#9CA3AF', lineHeight: '1.6' }}>
            SellDesk links verified orders directly to stock allocation, Cash on Delivery tracking, and planned courier dispatch integrations.
          </p>
        </div>

        {/* Example Order Operational State Display */}
        <div
          style={{
            maxWidth: '56rem',
            margin: '0 auto',
            width: '100%',
            background: 'rgba(17, 24, 39, 0.8)',
            border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
            borderRadius: '1.25rem',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Order Header Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>
                ACTIVE OPERATIONAL LIFECYCLE
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>
                Order #ORD-1042
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span className="badge badge-success">ORDER CONFIRMED</span>
              <span className="badge badge-warning">COURIER SLICE 9</span>
            </div>
          </div>

          {/* Connected Operational Steps Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(9.5rem, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              { icon: Users, label: 'Customer', val: 'Ayesha Khan', sub: 'Lahore • VIP Tag' },
              { icon: ShoppingBag, label: 'Product', val: 'Black Kurta (L)', sub: 'SKU: BK-204' },
              { icon: CreditCard, label: 'Payment', val: 'PKR 4,499', sub: 'Method: COD' },
              { icon: Boxes, label: 'Inventory', val: '1 Unit Reserved', sub: 'Warehouse A' },
              { icon: Truck, label: 'Courier', val: 'Leopard & TCS Booking', sub: 'Coming Soon (Slice 9)' },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>{step.label}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{step.val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{step.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Footnote on Courier Readiness */}
          <div style={{ fontSize: '0.78rem', color: '#9CA3AF', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 style={{ width: '0.9rem', height: '0.9rem', color: '#10B981', flexShrink: 0 }} />
            <span>Direct waybill booking and live consignment tracking for Leopard, TCS, and Trax couriers is planned for the Slice 9 logistics release.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Users,
  ShoppingBag,
  Boxes,
  CreditCard,
  BellRing,
  BarChart3,
  Truck,
  CheckCircle2,
  Tag,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface Capability {
  id: string;
  name: string;
  badge?: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const capabilities: Capability[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Conversations',
    badge: 'Live',
    icon: MessageSquare,
    title: 'Centralized WhatsApp Chat Stream',
    description: 'Manage all customer conversations in one place with automated intent detection and customer tagging.',
  },
  {
    id: 'ai',
    name: 'AI Order Understanding',
    badge: 'RAG AI',
    icon: Sparkles,
    title: 'Intelligent Order Extraction',
    description: 'AI automatically identifies product SKUs, sizes, colors, and shipping addresses with guardrailed human approval.',
  },
  {
    id: 'crm',
    name: 'Customer CRM',
    icon: Users,
    title: 'Unified Customer History & Profiles',
    description: 'Keep track of repeat buyers, lifetime order value, delivery addresses, and customer behavior tags.',
  },
  {
    id: 'orders',
    name: 'Order Management',
    icon: ShoppingBag,
    title: 'End-to-End Order Status Lifecycle',
    description: 'Track orders from initial extraction to confirmation, packing, shipping, and delivery completion.',
  },
  {
    id: 'inventory',
    name: 'Inventory Sync',
    icon: Boxes,
    title: 'Multi-Channel Stock Reservation',
    description: 'Stock levels automatically adjust upon order drafting to prevent overselling across busy channels.',
  },
  {
    id: 'payments',
    name: 'Payments Ledger',
    icon: CreditCard,
    title: 'COD & Digital Payment Tracking',
    description: 'Verify Cash on Delivery ledgers, bank transfers, and mobile wallet payments cleanly.',
  },
  {
    id: 'followups',
    name: 'Automated Follow-ups',
    icon: BellRing,
    title: 'Abandoned Conversation Reminders',
    description: 'Re-engage customers who inquired about products but haven’t completed their purchase.',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: BarChart3,
    title: 'Real-Time Revenue & Order Insights',
    description: 'Monitor daily sales volume in PKR, top-selling SKUs, and pending collection balances.',
  },
  {
    id: 'shipping',
    name: 'Shipping & Returns',
    badge: 'Coming Soon',
    icon: Truck,
    title: 'Courier Integration & Exchanges (Slice 9 Roadmap)',
    description: 'Planned Leopard and TCS courier waybill creation alongside customer return and exchange workflows.',
  },
];

export function ProductCapabilitiesSection() {
  const [activeId, setActiveId] = useState<string>('whatsapp');
  const activeCap = capabilities.find((c) => c.id === activeId) || capabilities[0];

  return (
    <section
      id="capabilities"
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
          gap: '3rem',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '46rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '0.0625rem solid rgba(99, 102, 241, 0.25)',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              color: '#A5B4FC',
              fontWeight: 600,
              alignSelf: 'center',
            }}
          >
            <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#6366F1' }} />
            <span>SellDesk Platform Capabilities</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Built For Serious <span className="gradient-text-indigo">SaaS Commerce Operations</span>
          </h2>

          <p style={{ fontSize: '0.975rem', color: '#9CA3AF', lineHeight: '1.6' }}>
            Explore how SellDesk integrates every core feature into one operational interface.
          </p>
        </div>

        {/* Capabilities Hub Grid (Left Navigation + Right UI Preview Stage) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '18.5rem 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="grid-2col-responsive"
        >
          {/* Left Side: Capability Selector Links */}
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
            role="tablist"
            aria-label="SellDesk product capabilities"
          >
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              const isActive = activeId === cap.id;

              return (
                <button
                  key={cap.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`capability-panel-${cap.id}`}
                  onClick={() => setActiveId(cap.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.625rem',
                    background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: isActive ? '0.0625rem solid rgba(16, 185, 129, 0.35)' : '0.0625rem solid transparent',
                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{ width: '1.125rem', height: '1.125rem', color: isActive ? '#34D399' : '#6B7280' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }}>{cap.name}</span>
                  </div>

                  {cap.badge && (
                    <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
                      {cap.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side: Interactive UI Preview Stage */}
          <div
            id={`capability-panel-${activeCap.id}`}
            role="tabpanel"
            className="glass-card animate-fade-in"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              minHeight: '28rem',
            }}
          >
            {/* Header info for selected capability */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>{activeCap.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{activeCap.description}</p>
              </div>
              <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>Real Product UI</span>
            </div>

            {/* Dynamic UI Content based on selected capability */}
            <CapabilityPreviewContent capabilityId={activeId} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityPreviewContent({ capabilityId }: { capabilityId: string }) {
  switch (capabilityId) {
    case 'whatsapp':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.75rem', padding: '1.25rem', border: '0.0625rem solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>CUSTOMER CHAT • +92300-4829102</span>
              <span>10:42 AM</span>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '0.0625rem solid rgba(16, 185, 129, 0.3)', borderRadius: '0.625rem', padding: '0.875rem', color: '#E5E7EB', fontSize: '0.9rem' }}>
              &ldquo;Black kurta size L available? Need COD Lahore.&rdquo;
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
              <span className="badge badge-success">PURCHASE_INTENT</span>
              <span className="badge badge-indigo">SKU: BK-204</span>
              <span className="badge badge-warning">CITY: LAHORE</span>
            </div>
          </div>
        </div>
      );

    case 'ai':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '0.0625rem solid rgba(99, 102, 241, 0.25)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Extracted Order Details (Pending Seller Approval)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#9CA3AF' }}>Product:</span> <strong style={{ color: '#FFF' }}>Black Kurta (BK-204)</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Size:</span> <strong style={{ color: '#FFF' }}>Large (L)</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Quantity:</span> <strong style={{ color: '#FFF' }}>1 Unit</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Price:</span> <strong style={{ color: '#34D399' }}>PKR 4,499</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Payment:</span> <strong style={{ color: '#FFF' }}>COD</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>City:</span> <strong style={{ color: '#FFF' }}>Lahore</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}>Approve Order</button>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}>Edit Details</button>
            </div>
          </div>
        </div>
      );

    case 'crm':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.75rem', padding: '1.25rem', border: '0.0625rem solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>Ayesha Khan</h4>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>ayesha.k@gmail.com • +92300-9920144</p>
              </div>
              <span className="badge badge-success">REPEAT BUYER</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Total Orders</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>12 Orders</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Lifetime Value</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>PKR 54,200</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Primary City</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>Lahore</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-indigo">VIP Customer</span>
              <span className="badge badge-warning">COD Preferred</span>
            </div>
          </div>
        </div>
      );

    case 'orders':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: '#ORD-1042', customer: 'Ahmed Khan', item: 'Black Kurta (L)', price: 'PKR 4,499', status: 'CONFIRMED', badge: 'badge-success' },
            { id: '#ORD-1041', customer: 'Fatima Zohra', item: 'Denim Jacket (M)', price: 'PKR 6,200', status: 'SHIPPED', badge: 'badge-indigo' },
            { id: '#ORD-1040', customer: 'Usman Ali', item: 'White Tee (L)', price: 'PKR 1,999', status: 'DELIVERED', badge: 'badge-success' },
          ].map((ord) => (
            <div key={ord.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.875rem 1rem', borderRadius: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0.0625rem solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ color: '#34D399', fontWeight: 700, fontSize: '0.85rem' }}>{ord.id}</span>
                <span style={{ color: '#FFF', fontWeight: 600, fontSize: '0.85rem', marginLeft: '0.75rem' }}>{ord.customer}</span>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{ord.item}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>{ord.price}</div>
                <span className={`badge ${ord.badge}`} style={{ fontSize: '0.65rem' }}>{ord.status}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'inventory':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { sku: 'BK-204 (L)', name: 'Oversized Black Kurta', available: 4, reserved: 1, lowStock: false },
            { sku: 'VJ-102 (M)', name: 'Vintage Wash Denim Jacket', available: 2, reserved: 2, lowStock: true },
            { sku: 'WT-501 (L)', name: 'Essential White Tee', available: 18, reserved: 0, lowStock: false },
          ].map((inv) => (
            <div key={inv.sku} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.875rem 1rem', borderRadius: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0.0625rem solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ color: '#818CF8', fontWeight: 700, fontSize: '0.85rem' }}>{inv.sku}</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>{inv.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 700 }}>{inv.available} Available</div>
                  <div style={{ fontSize: '0.72rem', color: '#FBBF24' }}>{inv.reserved} Reserved</div>
                </div>
                {inv.lowStock ? (
                  <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>Low Stock</span>
                ) : (
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>In Stock</span>
                )}
              </div>
            </div>
          ))}
        </div>
      );

    case 'payments':
      return (
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.75rem', padding: '1.25rem', border: '0.0625rem solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.75rem' }}>COD LEDGER SUMMARY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '0.0625rem solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#34D399' }}>Collected COD Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>PKR 485,400</div>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '0.0625rem solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#FBBF24' }}>Pending Courier Collection</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>PKR 64,200</div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>Verified against Leopard & TCS courier remittance payouts.</div>
        </div>
      );

    case 'followups':
      return (
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '0.0625rem solid rgba(245, 158, 11, 0.25)', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#FBBF24', fontWeight: 700 }}>ABANDONED CHAT RECOVERY TRIGGER</span>
            <span className="badge badge-warning">27 Pending Leads</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#E5E7EB', marginBottom: '1rem' }}>
            &ldquo;Customer inquired about Black Kurta (L) 4 hours ago but hasn’t confirmed shipping address.&rdquo;
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#34D399', marginBottom: '1rem' }}>
            Suggested Follow-up: &ldquo;Hi Ayesha! We have 4 units left in size L. Would you like us to reserve one for COD delivery?&rdquo;
          </div>
          <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>Send Automated Follow-up</button>
        </div>
      );

    case 'analytics':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.625rem', border: '0.0625rem solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Monthly Sales</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>PKR 485,400</div>
            <div style={{ fontSize: '0.72rem', color: '#34D399', marginTop: '0.25rem' }}>+18.4% growth</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.625rem', border: '0.0625rem solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Confirmed Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginTop: '0.25rem' }}>141 Orders</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.25rem' }}>12 pending dispatch</div>
          </div>
        </div>
      );

    case 'shipping':
      return (
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.75rem', padding: '1.25rem', border: '0.0625rem solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: '#34D399', fontWeight: 700, fontSize: '0.9rem' }}>Order #ORD-1042</div>
              <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>Courier Integration: Leopard & TCS (Planned)</div>
            </div>
            <span className="badge badge-warning">COMING IN SLICE 9</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: '#E5E7EB', lineHeight: '1.5', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
            Courier booking and waybill generation for Leopard, TCS, and Trax will be released in the upcoming Slice 9 logistics update.
          </div>
        </div>
      );

    default:
      return null;
  }
}

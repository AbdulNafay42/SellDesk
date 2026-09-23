'use client';

import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, MessageSquare, FileText, Users, Boxes, CreditCard, Truck, Sparkles } from 'lucide-react';

export function ProblemSolutionSection() {
  return (
    <section
      id="product"
      style={{
        padding: '5rem 1.5rem',
        background: 'rgba(9, 13, 22, 0.95)',
        borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
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
              background: 'rgba(244, 63, 94, 0.1)',
              border: '0.0625rem solid rgba(244, 63, 94, 0.25)',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              color: '#FDA4AF',
              fontWeight: 600,
              alignSelf: 'center',
            }}
          >
            <AlertCircle style={{ width: '0.875rem', height: '0.875rem', color: '#F43F5E' }} />
            <span>The Fragmentation Problem</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            From Fragmented Chats To <span className="gradient-text-whatsapp">Connected Operations</span>
          </h2>

          <p style={{ fontSize: '0.975rem', color: '#9CA3AF', lineHeight: '1.6' }}>
            Without a unified workflow, growing sellers often struggle to keep chats, inventory, customer records, and COD dispatches synchronized.
          </p>
        </div>

        {/* Operational Transformation Visual Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '2rem',
            alignItems: 'center',
          }}
          className="grid-2col-responsive"
        >
          {/* Column 1: Before (Fragmented State) */}
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.04)',
              border: '0.0625rem solid rgba(244, 63, 94, 0.2)',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(244, 63, 94, 0.15)', paddingBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="badge badge-rose">WITHOUT SELLDESK</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FDA4AF' }}>Fragmented Operations</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { icon: MessageSquare, title: 'Scattered Messages', desc: 'Customer orders trapped in endless WhatsApp chat threads' },
                { icon: FileText, title: 'Manual Note-taking', desc: 'Copying names, sizes, and addresses into notebooks or spreadsheets' },
                { icon: Boxes, title: 'Stock Uncertainty', desc: 'Overselling popular SKUs due to uncoordinated inventory checks' },
                { icon: CreditCard, title: 'Untracked COD', desc: 'Difficulty matching cash payments with delivered customer packages' },
                { icon: Truck, title: 'Manual Booking', desc: 'Manually entering delivery details into courier portals' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(17, 24, 39, 0.6)',
                      border: '0.0625rem solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <Icon style={{ width: '1.125rem', height: '1.125rem', color: '#F43F5E', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.2rem' }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transformation Center Connector */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 1.5rem rgba(16, 185, 129, 0.4)',
              }}
            >
              <Sparkles style={{ width: '1.75rem', height: '1.75rem', color: '#FFFFFF' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SELLDESK ENGINE
            </div>
            <ArrowRight style={{ width: '1.25rem', height: '1.25rem', color: '#34D399' }} />
          </div>

          {/* Column 2: After (SellDesk Connected Operations) */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.04)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.25)',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(16, 185, 129, 0.15)', paddingBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="badge badge-success">WITH SELLDESK</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399' }}>Unified Commerce Pipeline</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { icon: MessageSquare, title: 'Structured Chat Hub', desc: 'Automatic intent tagging & AI-assisted conversation management' },
                { icon: Sparkles, title: 'AI Order Parsing', desc: 'Instant extraction of SKU, size, quantity, and delivery address' },
                { icon: Users, title: 'Centralized Customer CRM', desc: 'Unified order history, tag profiles, and repeat buyer insights' },
                { icon: Boxes, title: 'Live Inventory Reservation', desc: 'Stock automatically allocated upon order confirmation' },
                { icon: Truck, title: 'Integrated COD Logistics', desc: 'Order details prepared for Slice 9 courier integration (Coming soon)' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '0.0625rem solid rgba(16, 185, 129, 0.15)',
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <CheckCircle2 style={{ width: '1.125rem', height: '1.125rem', color: '#34D399', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.2rem' }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

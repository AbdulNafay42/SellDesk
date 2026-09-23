'use client';

import React from 'react';
import { Radio, MessageSquare, Sparkles, ShieldCheck, Boxes, BellRing, ArrowRight } from 'lucide-react';

const workflowSteps = [
  {
    step: '01',
    title: 'Connect Channel',
    desc: 'Connect your official WhatsApp Cloud API business account in minutes.',
    icon: Radio,
    color: '#10B981',
  },
  {
    step: '02',
    title: 'Converse',
    desc: 'Customers chat naturally on WhatsApp to ask about products and pricing.',
    icon: MessageSquare,
    color: '#34D399',
  },
  {
    step: '03',
    title: 'AI Understands',
    desc: 'AI extracts SKU, size, quantity, payment method, and city automatically.',
    icon: Sparkles,
    color: '#6366F1',
  },
  {
    step: '04',
    title: 'Seller Approves',
    desc: 'Guardrailed approval ensures human control before finalizing any order.',
    icon: ShieldCheck,
    color: '#818CF8',
  },
  {
    step: '05',
    title: 'Fulfill & Dispatch',
    desc: 'Inventory is allocated and COD entries logged. Courier waybill dispatch coming in Slice 9.',
    icon: Boxes,
    color: '#F59E0B',
  },
  {
    step: '06',
    title: 'Follow Up',
    desc: 'Automated follow-up triggers re-engage abandoned chats and drive repeat sales.',
    icon: BellRing,
    color: '#06B6D4',
  },
];

export function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '5rem 1.5rem',
        background: 'rgba(9, 13, 22, 0.98)',
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
            <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
            <span>Operational Lifecycle</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            How SellDesk Powers Your <span className="gradient-text-whatsapp">End-to-End Workflow</span>
          </h2>

          <p style={{ fontSize: '0.975rem', color: '#9CA3AF', lineHeight: '1.6' }}>
            A continuous 6-step operational timeline connecting incoming chats directly to customer delivery.
          </p>
        </div>

        {/* Connected Step Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(11.5rem, 1fr))',
            gap: '1.25rem',
            position: 'relative',
          }}
        >
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="glass-card"
                style={{
                  padding: '1.375rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: step.color,
                      background: `${step.color}15`,
                      border: `0.0625rem solid ${step.color}33`,
                      padding: '0.2rem 0.625rem',
                      borderRadius: '0.375rem',
                    }}
                  >
                    STEP {step.step}
                  </span>

                  <div
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      background: `${step.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.color,
                    }}
                  >
                    <Icon style={{ width: '1rem', height: '1rem' }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>{step.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Edit3, XCircle, ArrowRight, MessageSquare } from 'lucide-react';

export function AiHumanControlSection() {
  const [orderStatus, setOrderStatus] = useState<'PENDING' | 'APPROVED' | 'EDITING' | 'REJECTED'>('PENDING');

  return (
    <section
      id="ai"
      style={{
        padding: '5rem 1.5rem',
        background: 'rgba(11, 15, 25, 0.95)',
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
        <div style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
            <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', color: '#6366F1' }} />
            <span>Guardrailed AI Architecture</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Assists Sales. <span className="gradient-text-indigo">Sellers Maintain Full Control.</span>
          </h2>

          <p style={{ fontSize: '0.975rem', color: '#9CA3AF', lineHeight: '1.6' }}>
            SellDesk AI analyzes incoming customer messages and drafts structured orders, but important financial and fulfillment decisions always remain under seller approval.
          </p>
        </div>

        {/* Interactive Approval Demo Box */}
        <div
          style={{
            maxWidth: '52rem',
            margin: '0 auto',
            width: '100%',
            background: 'rgba(17, 24, 39, 0.8)',
            border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
            borderRadius: '1.25rem',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 1.5rem 4rem rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Step 1: Incoming Customer Message */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '0.0625rem solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MessageSquare style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
              Step 1: Incoming Customer Message
            </div>
            <p style={{ fontSize: '0.9rem', color: '#E5E7EB', fontStyle: 'italic' }}>
              &ldquo;I want the black kurta, size L, COD delivery to Lahore.&rdquo;
            </p>
          </div>

          {/* Step 2: AI Intent Extraction */}
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '0.0625rem solid rgba(99, 102, 241, 0.2)', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#818CF8' }} />
              Step 2: AI Extracted Order Parameters
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div><span style={{ color: '#9CA3AF' }}>Product:</span> <strong style={{ color: '#FFF' }}>BK-204 (Black Kurta)</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Size:</span> <strong style={{ color: '#FFF' }}>Large (L)</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Quantity:</span> <strong style={{ color: '#FFF' }}>1 Unit</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Payment:</span> <strong style={{ color: '#FFF' }}>COD</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>City:</span> <strong style={{ color: '#FFF' }}>Lahore</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Amount:</span> <strong style={{ color: '#34D399' }}>PKR 4,499</strong></div>
            </div>
          </div>

          {/* Step 3: Seller Approval Action Bar */}
          <div style={{ borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck style={{ width: '1.125rem', height: '1.125rem', color: '#34D399' }} />
                Step 3: Human Review & Approval Action
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>Status:</span>
                <span className={`badge ${orderStatus === 'APPROVED' ? 'badge-success' : orderStatus === 'REJECTED' ? 'badge-rose' : 'badge-warning'}`}>
                  {orderStatus}
                </span>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setOrderStatus('APPROVED')}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                <CheckCircle2 style={{ width: '1rem', height: '1rem' }} />
                Approve & Create Order
              </button>

              <button
                onClick={() => setOrderStatus('EDITING')}
                className="btn-secondary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Edit3 style={{ width: '1rem', height: '1rem' }} />
                Edit Details
              </button>

              <button
                onClick={() => setOrderStatus('REJECTED')}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '0.0625rem solid rgba(244, 63, 94, 0.3)',
                  color: '#FDA4AF',
                  borderRadius: '0.625rem',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <XCircle style={{ width: '1rem', height: '1rem' }} />
                Reject Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

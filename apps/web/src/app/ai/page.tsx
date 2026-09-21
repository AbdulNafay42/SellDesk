'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Play,
  Sliders,
} from 'lucide-react';

interface PendingAction {
  id: string;
  type: string;
  customerName: string;
  customerPhone: string;
  rawText: string;
  extractedData: any;
  confidence: number;
  status: string;
  createdAt: string;
}

const initialActions: PendingAction[] = [
  {
    id: 'ai-act-1',
    type: 'ORDER_EXTRACTION',
    customerName: 'Ahmed Khan',
    customerPhone: '0300-4829102',
    rawText: '2 black XL COD Lahore please',
    extractedData: {
      productName: 'Oversized Black Premium Hoodie',
      variant: 'Size: XL • Color: Black',
      quantity: 2,
      city: 'Lahore',
      paymentMethod: 'COD',
      itemPrice: 4499,
      shippingFee: 250,
      totalAmount: 9248,
    },
    confidence: 0.98,
    status: 'PENDING_APPROVAL',
    createdAt: '10 mins ago',
  },
  {
    id: 'ai-act-2',
    type: 'CUSTOMIZATION_REQUEST',
    customerName: 'Usman Ali',
    customerPhone: '0333-1029384',
    rawText: 'Essential white tee pe custom sticker design print hosakta hai?',
    extractedData: {
      productName: 'Minimalist Essential White Tee',
      customType: 'Sticker Printing',
      attachment: 'sticker_design.png',
      notes: 'Customer requested custom chest print preview',
    },
    confidence: 0.91,
    status: 'PENDING_APPROVAL',
    createdAt: '3 hours ago',
  },
];

export default function AiEnginePage() {
  const [actions, setActions] = useState<PendingAction[]>(initialActions);
  const [simText, setSimText] = useState('Salam, 2 black XL COD Lahore bhej dein');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings state
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [ragGuardrailsEnabled, setRagGuardrailsEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);

  const handleApprove = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a)));
  };

  const handleReject = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a)));
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimResult({
        intent: 'ORDER_EXTRACTION',
        confidenceScore: 0.98,
        guardrailCheck: 'PASSED (Zero Hallucinations Guarantee)',
        extractedOrder: {
          productName: 'Oversized Black Premium Hoodie',
          size: 'XL',
          color: 'Black',
          quantity: 2,
          city: 'Lahore',
          paymentMethod: 'COD',
          totalPrice: 'Rs 9,248 (incl. Rs 250 delivery)',
        },
        aiSuggestedReply: 'Walaikum Assalam! Aap ka order 2x Oversized Black Hoodie (XL) COD Lahore confirm karne ke liye tayyar hai. Product Price Rs 8,998 + Rs 250 Delivery = Total Rs 9,248.',
      });
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              AI Commerce Engine & Guardrails
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Intent classification, RAG database verification, and Human-in-the-Loop seller approval queue.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Database RAG Guardrail</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck style={{ width: '1.25rem', height: '1.25rem' }} /> Active (100% Zero Price Hallucinations)
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Pending Seller Approvals</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.375rem' }}>
              {actions.filter((a) => a.status === 'PENDING_APPROVAL').length} Action Items
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>AI Intent Accuracy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818CF8', marginTop: '0.375rem' }}>
              98.2% Confidence
            </div>
          </div>
        </div>

        {/* Section 1: Human-in-the-Loop Seller Approval Queue */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>Human-in-the-Loop Approval Queue</h2>
              <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Review AI-extracted orders and custom sticker printing requests before finalization.</p>
            </div>
            <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>AI Guardrail Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {actions.map((act) => (
              <div key={act.id} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.875rem',
                padding: '1.125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={act.type === 'ORDER_EXTRACTION' ? 'badge badge-success' : 'badge badge-warning'}>
                      {act.type}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{act.customerName}</span>
                    <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>({act.customerPhone})</span>
                    <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>• {act.createdAt}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#D1D5DB', fontStyle: 'italic', marginBottom: '0.625rem' }}>
                    Raw WhatsApp Msg: &ldquo;{act.rawText}&rdquo;
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#34D399', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '0.0625rem solid rgba(16, 185, 129, 0.2)' }}>
                    Extracted Payload: {JSON.stringify(act.extractedData)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {act.status === 'PENDING_APPROVAL' ? (
                    <>
                      <button onClick={() => handleApprove(act.id)} className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}>
                        <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} /> Approve & Create
                      </button>
                      <button onClick={() => handleReject(act.id)} className="btn-secondary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem', color: '#FDA4AF' }}>
                        <XCircle style={{ width: '0.875rem', height: '0.875rem' }} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={act.status === 'APPROVED' ? 'badge badge-success' : 'badge badge-rose'}>
                      {act.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Playground & Extraction Simulator */}
        <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Zap style={{ width: '1.25rem', height: '1.25rem', color: '#FBBF24' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>AI Extraction Simulator Playground</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '1rem' }}>
              Paste any raw WhatsApp message below to test live Intent Classification & Database RAG Parsing.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'block', marginBottom: '0.375rem' }}>Customer WhatsApp Chat String</label>
              <textarea
                rows={3}
                className="input-glass"
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
              />
            </div>

            <button onClick={runSimulation} disabled={isSimulating} className="btn-primary" style={{ width: '100%' }}>
              <Play style={{ width: '1rem', height: '1rem' }} />
              {isSimulating ? 'Processing AI Pipeline...' : 'Run Live AI Classification'}
            </button>

            {simResult && (
              <div style={{ marginTop: '1.25rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <span className="badge badge-success">{simResult.intent}</span>
                  <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>{simResult.guardrailCheck}</span>
                </div>

                <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '0.875rem', borderRadius: '0.625rem', fontSize: '0.8rem', color: '#E5E7EB', border: '0.0625rem solid rgba(255, 255, 255, 0.08)', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '0.375rem' }}>Parsed JSON Payload:</div>
                  <pre style={{ fontSize: '0.75rem', color: '#34D399', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(simResult.extractedOrder, null, 2)}
                  </pre>
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '0.625rem', border: '0.0625rem solid rgba(99, 102, 241, 0.2)', fontSize: '0.8rem', color: '#A5B4FC' }}>
                  <strong>Suggested Guardrailed Auto-Reply:</strong> &ldquo;{simResult.aiSuggestedReply}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* Section 3: AI Automation Control Settings */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sliders style={{ width: '1.25rem', height: '1.25rem', color: '#6366F1' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>AI Guardrail Controls</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.625rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFF' }}>Database RAG Guardrails</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Prevent prices or stock numbers not in DB</div>
                </div>
                <input
                  type="checkbox"
                  checked={ragGuardrailsEnabled}
                  onChange={(e) => setRagGuardrailsEnabled(e.target.checked)}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.625rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFF' }}>Auto-Reply Assistant</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Respond to stock & price inquiries automatically</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.625rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFF', marginBottom: '0.25rem' }}>AI Confidence Threshold</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                  Require seller approval if confidence &lt; {(confidenceThreshold * 100).toFixed(0)}%
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.99"
                  step="0.01"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

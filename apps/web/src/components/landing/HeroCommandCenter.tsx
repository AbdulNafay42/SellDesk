'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, ShoppingBag, Boxes, CreditCard, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface PipelineNode {
  id: string;
  stepNumber: string;
  title: string;
  category: string;
  detail: string;
  status: string;
  badgeClass: string;
  icon: React.ElementType;
  accentColor: string;
  isFocal?: boolean;
}

const nodes: PipelineNode[] = [
  {
    id: 'whatsapp',
    stepNumber: '01',
    title: 'WhatsApp Customer Message',
    category: 'INCOMING CHAT',
    detail: 'Customer: "Black Kurta - Size L available? Delivery to Lahore COD?"',
    status: 'RECEIVED',
    badgeClass: 'badge-success',
    icon: MessageSquare,
    accentColor: '#10B981',
  },
  {
    id: 'ai',
    stepNumber: '02',
    title: 'AI Intent Understanding',
    category: 'RAG PARSER',
    detail: 'Detected SKU: BK-204 (L) • Intent: PURCHASE_ORDER • City: Lahore',
    status: 'PARSED',
    badgeClass: 'badge-indigo',
    icon: Sparkles,
    accentColor: '#6366F1',
  },
  {
    id: 'order',
    stepNumber: '03',
    title: 'Order & Customer CRM Core',
    category: 'CENTRAL HUB',
    detail: 'Order #ORD-1042 Created • Total: Rs 4,499 • Customer: Ahmed Khan',
    status: 'CONFIRMED',
    badgeClass: 'badge-success',
    icon: ShoppingBag,
    accentColor: '#34D399',
    isFocal: true,
  },
  {
    id: 'inventory',
    stepNumber: '04',
    title: 'Inventory Sync',
    category: 'STOCK DEDUCTION',
    detail: 'BK-204 (L) Reserved: 1 unit deducted (4 remaining in warehouse)',
    status: 'ALLOCATED',
    badgeClass: 'badge-warning',
    icon: Boxes,
    accentColor: '#F59E0B',
  },
  {
    id: 'payment',
    stepNumber: '05',
    title: 'Payment Ledger',
    category: 'COD VERIFICATION',
    detail: 'Method: Cash on Delivery (COD) • Ledger Entry Verified',
    status: 'VERIFIED',
    badgeClass: 'badge-indigo',
    icon: CreditCard,
    accentColor: '#818CF8',
  },
  {
    id: 'courier',
    stepNumber: '06',
    title: 'Courier Dispatch',
    category: 'PLANNED LOGISTICS',
    detail: 'Leopard & TCS Courier API integration planned for Slice 9 release',
    status: 'COMING SOON',
    badgeClass: 'badge-warning',
    icon: Truck,
    accentColor: '#06B6D4',
  },
];

export function HeroCommandCenter() {
  const [activeId, setActiveId] = useState<string>('order');
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);

  // Auto-cycle operational flow steps gently
  useEffect(() => {
    if (!isAutoCycling) return;

    const interval = setInterval(() => {
      setActiveId((prevId) => {
        const idx = nodes.findIndex((n) => n.id === prevId);
        const nextIdx = (idx + 1) % nodes.length;
        return nodes[nextIdx].id;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const activeNode = nodes.find((n) => n.id === activeId) || nodes[2];

  return (
    <div
      className="hero-perspective"
      style={{ width: '100%', padding: '1rem 0', position: 'relative' }}
      onMouseEnter={() => setIsAutoCycling(false)}
      onMouseLeave={() => setIsAutoCycling(true)}
    >
      {/* Main 2.5D Operational Command Stage */}
      <div
        className="hero-3d-stage"
        style={{
          width: '100%',
          position: 'relative',
          padding: '2.25rem 1.75rem',
          background: 'radial-gradient(ellipse at top, rgba(17, 24, 39, 0.95), rgba(9, 13, 22, 0.98))',
          borderRadius: '1.25rem',
          border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 2rem 5rem rgba(0, 0, 0, 0.85), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Stage Header: System Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0.75rem #10B981' }} />
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SELLDESK COMMERCE COMMAND CENTER
              </span>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.125rem' }}>
                Unified Operational Flow • WhatsApp ➔ AI ➔ CRM ➔ Inventory ➔ Logistics
              </div>
            </div>
          </div>

          {/* Active Flow Step Pill */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.5rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              color: '#D1D5DB',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ color: activeNode.accentColor, fontWeight: 700 }}>Active Step: {activeNode.stepNumber}</span>
            <span style={{ color: '#9CA3AF' }}>• {activeNode.category}</span>
          </div>
        </div>

        {/* 2.5D Physical Layering Stage (Desktop Grid & Central Focal Hub) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
            position: 'relative',
            zIndex: 2,
          }}
          className="command-center-grid-responsive"
        >
          {/* Column 1: Ingestion & AI Understanding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', transform: 'rotateY(6deg) translateZ(0.5rem)' }}>
            {nodes.slice(0, 2).map((node) => (
              <NodeCard key={node.id} node={node} isActive={activeId === node.id} onSelect={() => setActiveId(node.id)} />
            ))}
          </div>

          {/* Column 2: Central Focal Hub (Order & CRM Engine) */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'translateZ(1.75rem)' }}>
            {nodes.slice(2, 3).map((node) => (
              <NodeCard key={node.id} node={node} isActive={activeId === node.id} onSelect={() => setActiveId(node.id)} isCentralHub />
            ))}
          </div>

          {/* Column 3: Operational Execution & Logistics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transform: 'rotateY(-6deg) translateZ(0.5rem)' }}>
            {nodes.slice(3, 6).map((node) => (
              <NodeCard key={node.id} node={node} isActive={activeId === node.id} onSelect={() => setActiveId(node.id)} />
            ))}
          </div>
        </div>

        {/* Operational Footer Bar */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '0.0625rem solid rgba(16, 185, 129, 0.2)',
            borderRadius: '0.75rem',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.825rem',
            color: '#34D399',
            marginTop: '0.25rem',
            flexWrap: 'wrap',
            gap: '0.625rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CheckCircle2 style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
            <span>Operational Harmony: Customer chat directly generates verified order, reserves stock & creates consignment.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, fontSize: '0.8rem' }}>
            <span>Live Data Sync</span>
            <ArrowRight style={{ width: '0.875rem', height: '0.875rem' }} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .command-center-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .command-center-grid-responsive > div {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function NodeCard({
  node,
  isActive,
  onSelect,
  isCentralHub = false,
}: {
  node: PipelineNode;
  isActive: boolean;
  onSelect: () => void;
  isCentralHub?: boolean;
}) {
  const Icon = node.icon;

  return (
    <div
      onClick={onSelect}
      style={{
        padding: isCentralHub ? '1.5rem 1.25rem' : '1.125rem',
        borderRadius: '0.875rem',
        cursor: 'pointer',
        background: isActive
          ? 'rgba(17, 24, 39, 0.98)'
          : isCentralHub
          ? 'rgba(17, 24, 39, 0.9)'
          : 'rgba(17, 24, 39, 0.75)',
        border: isActive
          ? `0.0625rem solid ${node.accentColor}`
          : isCentralHub
          ? '0.0625rem solid rgba(16, 185, 129, 0.35)'
          : '0.0625rem solid rgba(255, 255, 255, 0.1)',
        boxShadow: isActive
          ? `0 1.25rem 3rem rgba(0, 0, 0, 0.95), 0 0 1.5rem ${node.accentColor}33`
          : isCentralHub
          ? '0 1rem 2.5rem rgba(0, 0, 0, 0.7), 0 0 1rem rgba(16, 185, 129, 0.15)'
          : '0 0.5rem 1.5rem rgba(0, 0, 0, 0.4)',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
      }}
    >
      {/* Central Hub Badge */}
      {isCentralHub && (
        <div
          style={{
            position: 'absolute',
            top: '-0.625rem',
            right: '1rem',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: '0.625rem',
            fontWeight: 800,
            padding: '0.2rem 0.625rem',
            borderRadius: '999px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: '0 0.25rem 0.75rem rgba(16, 185, 129, 0.4)',
          }}
        >
          CORE ENGINE HUB
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.625rem',
              background: `${node.accentColor}22`,
              border: `0.0625rem solid ${node.accentColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: node.accentColor,
            }}
          >
            <Icon style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Step {node.stepNumber} • {node.category}
            </div>
            <div style={{ fontSize: isCentralHub ? '1rem' : '0.875rem', fontWeight: 800, color: '#FFFFFF' }}>
              {node.title}
            </div>
          </div>
        </div>

        <span className={`badge ${node.badgeClass}`} style={{ fontSize: '0.65rem' }}>
          {node.status}
        </span>
      </div>

      {/* Detail Code Snippet / Payload Box */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '0.0625rem solid rgba(255, 255, 255, 0.06)',
          borderRadius: '0.5rem',
          padding: '0.625rem 0.75rem',
          fontSize: '0.78rem',
          color: '#D1D5DB',
          lineHeight: '1.4',
        }}
      >
        {node.detail}
      </div>
    </div>
  );
}

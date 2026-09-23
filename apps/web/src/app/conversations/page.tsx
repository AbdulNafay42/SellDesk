'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  MapPin,
  Sparkles,
  ShoppingBag,
  CheckCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'CUSTOMER' | 'AI_ASSISTANT' | 'SELLER' | 'SYSTEM_AI';
  text: string;
  time: string;
  isAiExtraction?: boolean;
}

interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  intentTag: string;
  intentConfidence: number;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    customerName: 'Ahmed Khan',
    customerPhone: '0300-4829102',
    city: 'Lahore',
    lastMessage: '2 black XL COD Lahore please',
    lastMessageTime: '10m ago',
    unreadCount: 1,
    intentTag: 'ORDER_EXTRACTION',
    intentConfidence: 0.98,
    messages: [
      { id: 'm-1', sender: 'CUSTOMER', text: 'Salam, Black Hoodie XL available hai?', time: '10:14 AM' },
      { id: 'm-2', sender: 'AI_ASSISTANT', text: 'Walaikum Assalam! Ji Black Hoodie XL main 3 items stock main available hain (Rs 4,499 each). Delivery 2-3 working days.', time: '10:14 AM' },
      { id: 'm-3', sender: 'CUSTOMER', text: '2 black XL COD Lahore please', time: '10:16 AM' },
      { id: 'm-4', sender: 'SYSTEM_AI', text: '⚡ AI Extracted Order: 2x Oversized Black Hoodie (XL) • Total Rs 9,248 (incl. Rs 250 delivery) • COD Lahore', time: '10:16 AM', isAiExtraction: true },
    ],
  },
  {
    id: 'conv-2',
    customerName: 'Fatima Zohra',
    customerPhone: '0321-9920144',
    city: 'Karachi',
    lastMessage: 'Shukriya, main order check krti hun',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    intentTag: 'AVAILABILITY',
    intentConfidence: 0.94,
    messages: [
      { id: 'm-5', sender: 'CUSTOMER', text: 'Denim jacket size M stock main hai?', time: '09:00 AM' },
      { id: 'm-6', sender: 'AI_ASSISTANT', text: 'Ji Vintage Wash Denim Jacket size M available hai (Rs 6,200). Delivery 3 working days.', time: '09:00 AM' },
      { id: 'm-7', sender: 'CUSTOMER', text: 'Shukriya, main order check krti hun', time: '09:05 AM' },
    ],
  },
  {
    id: 'conv-3',
    customerName: 'Usman Ali',
    customerPhone: '0333-1029384',
    city: 'Islamabad',
    lastMessage: 'Sticker custom print hosakta hai shirt pe?',
    lastMessageTime: '3h ago',
    unreadCount: 2,
    intentTag: 'CUSTOMIZATION',
    intentConfidence: 0.91,
    messages: [
      { id: 'm-8', sender: 'CUSTOMER', text: 'Essential white tee pe custom sticker design print hosakta hai?', time: '08:30 AM' },
      { id: 'm-9', sender: 'AI_ASSISTANT', text: 'Ji bilkul! Custom print request humari team review krti hai. Aap design image bhej dein.', time: '08:31 AM' },
    ],
  },
];

export default function ConversationsPage() {
  const { activeBusinessId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchConversations = async () => {
      if (!activeBusinessId) return;
      try {
        const data = await api.get<Conversation[]>('/api/conversations');
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setConversations(list);
          if (list.length > 0) {
            setActiveConvId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    fetchConversations();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'SELLER',
      text: replyText,
      time: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: replyText,
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setReplyText('');
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerPhone.includes(search) ||
      c.intentTag.toLowerCase().includes(search.toLowerCase())
  );

  const getIntentBadge = (tag: string) => {
    switch (tag) {
      case 'ORDER_EXTRACTION':
        return 'badge-success';
      case 'AVAILABILITY':
        return 'badge-indigo';
      case 'CUSTOMIZATION':
        return 'badge-warning';
      default:
        return 'badge-rose';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{
        backgroundColor: '#090D16',
        padding: 0,
        height: 'calc(100vh - 4.375rem)',
        display: 'flex',
        overflow: 'hidden',
      }} className="animate-fade-in chat-layout-responsive">
        {/* Left Panel: Conversations Thread List */}
        <div style={{ width: '21.25rem', borderRight: '0.0625rem solid rgba(255, 255, 255, 0.08)', background: 'rgba(11, 15, 25, 0.6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.06)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare style={{ width: '1.125rem', height: '1.125rem', color: '#10B981' }} />
              WhatsApp Inbox
            </h2>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem', color: '#6B7280' }} />
              <input
                type="text"
                placeholder="Search chat or phone..."
                className="input-glass"
                style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      padding: '0.75rem 0.875rem',
                      borderRadius: '0.75rem',
                      marginBottom: '0.375rem',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '0.0625rem solid rgba(16, 185, 129, 0.3)' : '0.0625rem solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>{conv.customerName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{conv.lastMessageTime}</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.375rem' }}>
                      {conv.lastMessage}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`badge ${getIntentBadge(conv.intentTag)}`} style={{ fontSize: '0.62rem', padding: '0.125rem 0.375rem' }}>
                        {conv.intentTag}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>{conv.customerPhone}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Panel: Active WhatsApp Chat Thread */}
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            <MessageSquare style={{ width: '3rem', height: '3rem', color: '#4B5563', marginBottom: '1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>No WhatsApp Conversations</div>
            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>Incoming WhatsApp customer inquiries will appear here.</div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(9, 13, 22, 0.4)' }}>
            {/* Active Chat Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(17, 24, 39, 0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#FFF' }}>
                {activeConv.customerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>{activeConv.customerName}</h3>
                <p style={{ fontSize: '0.78rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone style={{ width: '0.75rem', height: '0.75rem' }} /> {activeConv.customerPhone} • {activeConv.city}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <button onClick={() => setIsOrderModalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}>
                <ShoppingBag style={{ width: '0.875rem', height: '0.875rem' }} /> Convert Chat to Order
              </button>
            </div>
          </div>

          {/* Messages Thread Body */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {activeConv.messages.map((msg) => {
              if (msg.isAiExtraction) {
                return (
                  <div key={msg.id} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '0.0625rem solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', padding: '0.875rem', alignSelf: 'center', maxWidth: '85%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 800, color: '#34D399', marginBottom: '0.25rem' }}>
                      <Sparkles style={{ width: '0.875rem', height: '0.875rem' }} /> AI INTENT ENGINE HIGHLIGHT
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 600 }}>{msg.text}</div>
                  </div>
                );
              }

              const isMe = msg.sender === 'SELLER' || msg.sender === 'AI_ASSISTANT';
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    background: isMe ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'rgba(31, 41, 55, 0.8)',
                    color: '#FFF',
                    padding: '0.625rem 0.875rem',
                    borderRadius: isMe ? '1rem 1rem 0.125rem 1rem' : '1rem 1rem 1rem 0.125rem',
                    border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 0.25rem 0.75rem rgba(0,0,0,0.15)',
                  }}
                >
                  {msg.sender === 'AI_ASSISTANT' && (
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles style={{ width: '0.625rem', height: '0.625rem' }} /> AI Auto-Response
                    </div>
                  )}
                  <div style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>{msg.text}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                    <span>{msg.time}</span>
                    <CheckCheck style={{ width: '0.75rem', height: '0.75rem' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Composer Bar */}
          <form onSubmit={handleSendReply} style={{ padding: '1rem 1.5rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.75rem', background: 'rgba(17, 24, 39, 0.8)' }}>
            <input
              type="text"
              placeholder="Type your WhatsApp reply..."
              className="input-glass"
              style={{ flex: 1 }}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 1.25rem' }}>
              <Send style={{ width: '1rem', height: '1rem' }} /> Send
            </button>
          </form>
        </div>
        )}

        {/* Right Panel: Customer Quick Summary */}
        {activeConv && (
          <div className="search-hide-mobile" style={{ width: '17.5rem', borderLeft: '0.0625rem solid rgba(255, 255, 255, 0.08)', background: 'rgba(11, 15, 25, 0.6)', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Customer Intelligence
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', color: '#FFF', marginBottom: '0.5rem' }}>
                {activeConv.customerName.substring(0, 2).toUpperCase()}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>{activeConv.customerName}</h4>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{activeConv.customerPhone}</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.75rem', padding: '0.875rem', border: '0.0625rem solid rgba(255, 255, 255, 0.06)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>AI Intent Tag</div>
              <div style={{ marginTop: '0.25rem' }}>
                <span className={`badge ${getIntentBadge(activeConv.intentTag)}`}>{activeConv.intentTag}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.375rem' }}>
                Confidence Score: {(activeConv.intentConfidence * 100).toFixed(0)}%
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.75rem', padding: '0.875rem', border: '0.0625rem solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Delivery Address</div>
              <div style={{ fontSize: '0.8rem', color: '#E5E7EB', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#10B981', marginTop: '0.125rem' }} />
                <span>{activeConv.city}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Order Creation Modal */}
        {isOrderModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(0.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1.25rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '31.25rem', padding: '1.5rem', background: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>Convert Chat to Order</h3>
                <button onClick={() => setIsOrderModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.125rem', height: '1.125rem' }} />
                </button>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.625rem', border: '0.0625rem solid rgba(16, 185, 129, 0.2)', marginBottom: '1rem', fontSize: '0.8rem', color: '#34D399' }}>
                Pre-filled from WhatsApp chat with <strong>{activeConv.customerName}</strong> ({activeConv.customerPhone})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Product Item</label>
                  <input type="text" className="input-glass" readOnly value="Oversized Black Premium Hoodie (XL) x 2" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>City</label>
                    <input type="text" className="input-glass" readOnly value={activeConv.city} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#D1D5DB', display: 'block', marginBottom: '0.25rem' }}>Total Amount</label>
                    <input type="text" className="input-glass" readOnly value="Rs 9,248 (COD)" />
                  </div>
                </div>

                <button onClick={() => setIsOrderModalOpen(false)} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Confirm & Generate Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';

interface Variant {
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  sku: string;
  imageUrl: string;
  status: string;
  variants: Variant[];
}

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Oversized Black Premium Hoodie',
    description: 'Heavyweight fleece cotton hoodie designed for street style.',
    basePrice: 4499,
    sku: 'HD-BLK-001',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    variants: [
      { size: 'S', color: 'Black', sku: 'HD-BLK-S', price: 4499, stock: 15 },
      { size: 'M', color: 'Black', sku: 'HD-BLK-M', price: 4499, stock: 24 },
      { size: 'L', color: 'Black', sku: 'HD-BLK-L', price: 4499, stock: 8 },
      { size: 'XL', color: 'Black', sku: 'HD-BLK-XL', price: 4499, stock: 3 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Vintage Wash Denim Jacket',
    description: 'Distressed vintage denim jacket with customized brass buttons.',
    basePrice: 6200,
    sku: 'JKT-VNT-002',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80',
    variants: [
      { size: 'M', color: 'Blue Wash', sku: 'JKT-VNT-M', price: 6200, stock: 10 },
      { size: 'L', color: 'Blue Wash', sku: 'JKT-VNT-L', price: 6200, stock: 5 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Minimalist Essential White Tee',
    description: 'Combed organic cotton luxury daily T-shirt.',
    basePrice: 1999,
    sku: 'TS-WHT-003',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    variants: [
      { size: 'S', color: 'White', sku: 'TS-WHT-S', price: 1999, stock: 40 },
      { size: 'M', color: 'White', sku: 'TS-WHT-M', price: 1999, stock: 35 },
      { size: 'L', color: 'White', sku: 'TS-WHT-L', price: 1999, stock: 20 },
    ],
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('2999');
  const [sku, setSku] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { size: 'S', color: 'Black', sku: 'SKU-S', price: 2999, stock: 10 },
    { size: 'M', color: 'Black', sku: 'SKU-M', price: 2999, stock: 15 },
    { size: 'L', color: 'Black', sku: 'SKU-L', price: 2999, stock: 12 },
  ]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      description,
      basePrice: Number(basePrice),
      sku: sku || `SKU-${Date.now()}`,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80',
      variants,
    };

    setProducts([newProd, ...products]);
    setIsModalOpen(false);
    // Reset form
    setName('');
    setDescription('');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <Header />

      <main style={{ marginLeft: '260px', marginTop: '70px', flex: 1, padding: '32px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Product Catalog</h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '4px' }}>
              Manage clothing items, sizes, colors, SKUs and live stock inventory.
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '18px', height: '18px' }} />
            Add New Product
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              className="input-glass"
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary">
            <Filter style={{ width: '16px', height: '16px' }} />
            Filter
          </button>
        </div>

        {/* Product Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Product Image Header */}
                <div style={{ position: 'relative', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                  <Image src={prod.imageUrl} alt={prod.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="badge badge-success">{prod.status}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 700, marginBottom: '4px' }}>{prod.sku}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>{prod.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '16px', lineClamp: 2 }}>{prod.description}</p>

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginBottom: '16px' }}>
                  Rs {prod.basePrice.toLocaleString()}
                </div>

                {/* Variants List */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers style={{ width: '14px', height: '14px' }} />
                    <span>Variants & Stock ({prod.variants.length})</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {prod.variants.map((v, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontWeight: 700, color: '#FFF' }}>{v.size}</span>
                        <span style={{ color: '#9CA3AF' }}>•</span>
                        <span style={{ color: v.stock <= 5 ? '#F43F5E' : '#34D399', fontWeight: 600 }}>{v.stock} in stock</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                  <Edit2 style={{ width: '14px', height: '14px' }} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '28px', background: '#111827' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>Add New Product</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oversized Linen Shirt"
                    className="input-glass"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>Base Price (PKR)</label>
                    <input
                      type="number"
                      required
                      className="input-glass"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>Base SKU</label>
                    <input
                      type="text"
                      placeholder="SHRT-LIN-001"
                      className="input-glass"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short product description..."
                    className="input-glass"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>Variants (Sizes & Initial Stock)</div>
                  {variants.map((v, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                      <input type="text" className="input-glass" value={v.size} readOnly style={{ fontSize: '0.8rem' }} />
                      <input type="text" className="input-glass" value={v.color} readOnly style={{ fontSize: '0.8rem' }} />
                      <input
                        type="number"
                        className="input-glass"
                        value={v.stock}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i].stock = Number(e.target.value);
                          setVariants(updated);
                        }}
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle style={{ width: '16px', height: '16px' }} /> Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

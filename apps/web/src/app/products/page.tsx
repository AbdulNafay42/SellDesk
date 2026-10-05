'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  X,
  CheckCircle,
  Upload,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80';

const normalizeProduct = (p: any): Product => ({
  id: p.id,
  name: p.name || 'Untitled Product',
  description: p.description || 'No description provided.',
  basePrice: p.basePrice || p.pricePKR || 0,
  sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
  imageUrl: p.imageUrl || DEFAULT_IMAGE_URL,
  status: p.status || 'ACTIVE',
  variants: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [
    { size: 'S', color: 'Standard', sku: `${p.sku || 'SKU'}-S`, price: p.basePrice || 0, stock: 10 },
    { size: 'M', color: 'Standard', sku: `${p.sku || 'SKU'}-M`, price: p.basePrice || 0, stock: 15 },
    { size: 'L', color: 'Standard', sku: `${p.sku || 'SKU'}-L`, price: p.basePrice || 0, stock: 12 },
  ],
});

export default function ProductsPage() {
  const { activeBusinessId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('2999');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { size: 'S', color: 'Black', sku: 'SKU-S', price: 2999, stock: 10 },
    { size: 'M', color: 'Black', sku: 'SKU-M', price: 2999, stock: 15 },
    { size: 'L', color: 'Black', sku: 'SKU-L', price: 2999, stock: 12 },
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      if (!activeBusinessId) return;
      try {
        const data = await api.get<any[]>('/api/products');
        if (isMounted && Array.isArray(data)) {
          setProducts(data.map(normalizeProduct));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalImageUrl = imageUrl || DEFAULT_IMAGE_URL;
    const finalSku = sku.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    const preparedVariants = (variants || []).map((v) => ({
      ...v,
      sku: `${finalSku}-${(v.size || 'STD').trim().toUpperCase()}-${(v.color || 'CLR').trim().toUpperCase()}`,
      price: Number(basePrice) || 0,
      stock: Number(v.stock) || 0,
    }));

    try {
      const created = await api.post<any>('/api/products', {
        name,
        description,
        basePrice: Number(basePrice),
        sku: finalSku,
        imageUrl: finalImageUrl,
        variants: preparedVariants,
      });

      if (created) {
        const normalized = normalizeProduct({ ...created, imageUrl: finalImageUrl });
        setProducts((prev) => [normalized, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create product via API:', err);
      const newProd: Product = normalizeProduct({
        id: `prod-${Date.now()}`,
        name,
        description,
        basePrice: Number(basePrice),
        sku: finalSku,
        status: 'ACTIVE',
        imageUrl: finalImageUrl,
        variants: preparedVariants,
      });
      setProducts((prev) => [newProd, ...prev]);
    }

    setIsModalOpen(false);
    setName('');
    setDescription('');
    setSku('');
    setImageUrl('');
    setVariants([
      { size: 'S', color: 'Black', sku: 'SKU-S', price: 2999, stock: 10 },
      { size: 'M', color: 'Black', sku: 'SKU-M', price: 2999, stock: 15 },
      { size: 'L', color: 'Black', sku: 'SKU-L', price: 2999, stock: 12 },
    ]);
  };

  const filteredProducts = products.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#090D16', color: '#FFFFFF' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />

      <main style={{ backgroundColor: '#090D16' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Product Catalog</h1>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Manage clothing items, sizes, colors, SKUs and live stock inventory.
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
            Add New Product
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '15rem' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              className="input-glass"
              style={{ paddingLeft: '2.75rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary">
            <Filter style={{ width: '1rem', height: '1rem' }} />
            Filter
          </button>
        </div>

        {/* Product Cards Grid with Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
            <Package style={{ width: '3rem', height: '3rem', margin: '0 auto 0.875rem auto', color: '#4B5563' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>0 Products</div>
            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
              No products found in this business catalog. Click &ldquo;Add New Product&rdquo; to add one.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', gap: '1.5rem' }}>
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Product Image Header */}
                  <div style={{ position: 'relative', height: '11.25rem', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1rem', background: '#111827' }}>
                    <img
                      src={prod.imageUrl || DEFAULT_IMAGE_URL}
                      alt={prod.name || 'Product'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '0.625rem', right: '0.625rem' }}>
                      <span className="badge badge-success">{prod.status || 'ACTIVE'}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 700, marginBottom: '0.25rem' }}>{prod.sku}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '0.375rem' }}>{prod.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '1rem' }}>{prod.description}</p>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginBottom: '1rem' }}>
                    Rs {prod.basePrice.toLocaleString()}
                  </div>

                  {/* Variants List */}
                  <div style={{ borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Layers style={{ width: '0.875rem', height: '0.875rem' }} />
                      <span>Variants & Stock ({(prod.variants || []).length})</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(prod.variants || []).map((v, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '0.0625rem solid rgba(255, 255, 255, 0.08)',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <span style={{ fontWeight: 700, color: '#FFF' }}>
                            {v.size || 'STD'}{v.color ? ` / ${v.color}` : ''}
                          </span>
                          <span style={{ color: '#9CA3AF' }}>•</span>
                          <span style={{ color: v.stock <= 5 ? '#F43F5E' : '#34D399', fontWeight: 600 }}>{v.stock} in stock</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.06)', paddingTop: '0.875rem' }}>
                  <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                    <Edit2 style={{ width: '0.875rem', height: '0.875rem' }} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(0.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1.25rem',
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '37.5rem', padding: '1.75rem', background: '#111827', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>Add New Product</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.375rem' }}>Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oversized Linen Shirt"
                    className="input-glass"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.375rem' }}>Base Price (PKR)</label>
                    <input
                      type="number"
                      required
                      className="input-glass"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.375rem' }}>Base SKU</label>
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
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.375rem' }}>Product Image</label>
                  {imageUrl ? (
                    <div style={{ position: 'relative', width: '100%', height: '9rem', borderRadius: '0.625rem', overflow: 'hidden', border: '0.0625rem solid rgba(16, 185, 129, 0.4)', marginBottom: '0.5rem' }}>
                      <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: 'rgba(239, 68, 68, 0.85)',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '0.375rem',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} /> Remove Image
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {/* File Upload Zone */}
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1.25rem',
                          border: '0.125rem dashed rgba(16, 185, 129, 0.35)',
                          borderRadius: '0.625rem',
                          background: 'rgba(16, 185, 129, 0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Upload style={{ width: '1.5rem', height: '1.5rem', color: '#34D399', marginBottom: '0.375rem' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>Upload Product Image File</span>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.125rem' }}>Click to choose PNG, JPG or WEBP image</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setImageUrl(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {/* Or URL input & presets */}
                      <input
                        type="url"
                        placeholder="Or paste HTTPS image URL..."
                        className="input-glass"
                        style={{ fontSize: '0.8rem' }}
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />

                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', marginRight: '0.25rem' }}>Presets:</span>
                        {[
                          { label: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80' },
                          { label: 'Denim Jacket', url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80' },
                          { label: 'T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80' },
                          { label: 'Apparel', url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80' },
                        ].map((preset) => (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => setImageUrl(preset.url)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#9CA3AF',
                              border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.375rem' }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short product description..."
                    className="input-glass"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                  <div style={{ borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>Variants (Sizes, Colors & Initial Stock)</div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSize = variants.length === 0 ? 'S' : variants.length === 1 ? 'M' : variants.length === 2 ? 'L' : 'XL';
                          setVariants([
                            ...variants,
                            { size: nextSize, color: 'Black', sku: `${sku || 'SKU'}-${nextSize}`, price: Number(basePrice) || 2999, stock: 10 }
                          ]);
                        }}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34D399',
                          border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Plus style={{ width: '0.75rem', height: '0.75rem' }} /> Add Variant
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {variants.map((v, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'block', marginBottom: '0.125rem' }}>Size</label>
                            <input
                              type="text"
                              className="input-glass"
                              placeholder="Size (e.g. S, M, XL)"
                              value={v.size}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].size = e.target.value;
                                updated[i].sku = `${sku || 'SKU'}-${e.target.value}`;
                                setVariants(updated);
                              }}
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'block', marginBottom: '0.125rem' }}>Color</label>
                            <input
                              type="text"
                              className="input-glass"
                              placeholder="Color (e.g. Black, White, Blue)"
                              value={v.color}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].color = e.target.value;
                                setVariants(updated);
                              }}
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'block', marginBottom: '0.125rem' }}>Stock</label>
                            <input
                              type="number"
                              className="input-glass"
                              min={0}
                              value={v.stock}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].stock = Number(e.target.value);
                                setVariants(updated);
                              }}
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>

                          {variants.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#F43F5E',
                                border: 'none',
                                borderRadius: '0.375rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                marginTop: '0.875rem'
                              }}
                              title="Remove Variant"
                            >
                              <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                            </button>
                          ) : (
                            <div style={{ width: '1.875rem' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle style={{ width: '1rem', height: '1rem' }} /> Save Product
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




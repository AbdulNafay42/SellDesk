'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, Mail, Lock, Phone, MapPin, Globe, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    city: '',
    country: 'Pakistan',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(formData);
      // On success, redirect to /signup/pending passing the business name
      const queryParam = encodeURIComponent(formData.businessName);
      router.push(`/signup/pending?businessName=${queryParam}`);
    } catch (err: any) {
      if (err?.status === 409) {
        setError('An account with this email address already exists.');
      } else {
        setError(err?.message || 'Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#090D16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '34rem',
          padding: '2.5rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <div
            style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.375rem',
            }}
          >
            <Building2 style={{ width: '1.75rem', height: '1.75rem', color: '#10B981' }} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#FFFFFF' }}>Register Your Business</h1>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
            Join SellDesk to manage WhatsApp orders, customer CRM & logistics.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '0.0625rem solid rgba(244, 63, 94, 0.3)',
              borderRadius: '0.625rem',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              color: '#FDA4AF',
              fontSize: '0.825rem',
            }}
          >
            <AlertCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Personal Information */}
          <div style={{ borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Owner Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Abdul Nafay"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-glass"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+923001234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-glass"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="owner@store.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-glass"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-glass"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Business Profile
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                required
                placeholder="SellDesk Apparels PK"
                value={formData.businessName}
                onChange={handleChange}
                className="input-glass"
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Lahore"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-glass"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  placeholder="Pakistan"
                  value={formData.country}
                  onChange={handleChange}
                  className="input-glass"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 style={{ width: '1.125rem', height: '1.125rem', animation: 'spin 1s linear infinite' }} />
                Submitting Application...
              </>
            ) : (
              <>
                Submit Business Application
                <ArrowRight style={{ width: '1.125rem', height: '1.125rem' }} />
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <div style={{ textAlign: 'center', borderTop: '0.0625rem solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.825rem', color: '#9CA3AF' }}>
            Already registered?{' '}
            <Link
              href="/login"
              style={{ color: '#34D399', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign In to Your Account
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ClientAuthGuard } from '../components/layout/ClientAuthGuard';

export const metadata: Metadata = {
  title: 'SellDesk — WhatsApp Commerce Management Platform',
  description: 'Manage WhatsApp orders, customer CRM, automated follow-ups, and COD logistics for small businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientAuthGuard>{children}</ClientAuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

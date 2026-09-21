import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}

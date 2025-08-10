import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HRMind – Prevedi, previeni, migliora',
  description: 'Cruscotto HR predittivo con wellbeing e consigli azionabili.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

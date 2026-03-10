import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/components/AppContext';

export const metadata: Metadata = {
  title: 'AI Receptionist',
  description: 'AI-powered receptionist with Cal.com integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

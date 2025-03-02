import { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Download Dashboard',
  description: 'Monitor and manage OHLCV data downloads',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
      <Toaster />
    </div>
  );
} 
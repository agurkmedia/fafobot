import { DownloadStatus } from '../components/DownloadStatus';

export default function MarketDataPage() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Market Data</h1>
      <DownloadStatus />
    </div>
  );
} 
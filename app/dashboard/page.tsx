'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Clock, Download, Loader2, StopCircle } from 'lucide-react';
import ActiveDownloadsTable from '@/components/dashboard/active-downloads-table';
import QueuedDownloadsTable from '@/components/dashboard/queued-downloads-table';
import CompletedDownloadsTable from '@/components/dashboard/completed-downloads-table';
import BlacklistedSymbolsTable from '@/components/dashboard/blacklisted-symbols-table';
import { useToast } from '@/components/ui/use-toast';
import { useWebSocketStore, type ActiveDownloadStatus, type QueuedDownloadStatus, type CompletedDownloadStatus } from '../lib/websocketService';

// Define interfaces to match the table component requirements
interface ActiveDownload {
  symbol: string;
  progress: string;
  progress_percent: number;
  chunks_completed: number;
  total_chunks: number;
  candles_per_second: number;
  estimated_remaining_seconds: number;
  start_time?: string;
  elapsed_time?: string;
  time_remaining?: string;
  time_remaining_seconds?: number;
  remaining_candles?: number;
  total_candles?: number;
  new_candles_added?: number;
}

interface QueuedDownload {
  symbol: string;
  position_in_queue: number;
}

interface CompletedDownload {
  symbol: string;
  downloaded_candles: number;
  new_candles_added: number;
  duration: string;
  completed_at: number;
  candles_per_second: number;
}

export default function DashboardPage() {
  const { downloadStatus, isConnected, connect, disconnect } = useWebSocketStore();
  const [loading, setLoading] = useState(false);
  const [concurrencyInput, setConcurrencyInput] = useState('10');
  const [symbolInput, setSymbolInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    connect();

    return () => {
      console.log('Cleaning up WebSocket connection...');
      disconnect();
    };
  }, []);

  const startDownload = async () => {
    try {
      setLoading(true);
      const concurrency = parseInt(concurrencyInput);
      
      if (isNaN(concurrency) || concurrency < 1) {
        toast({
          title: 'Error',
          description: 'Concurrency must be a positive number',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Starting download with concurrency:', concurrency);
      
      const response = await fetch('/api/market/download-all-ohlcv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concurrency: concurrency
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend error (${response.status}): ${errorText}`);
        throw new Error(`Failed to start download: ${errorText}`);
      }
      
      toast({
        title: 'Success',
        description: `Download started with concurrency ${concurrency}`,
      });
    } catch (error) {
      console.error('Error starting download:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start download',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const stopDownloads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/market/stop-downloads', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop downloads');
      }
      
      toast({
        title: 'Success',
        description: 'Downloads stopped successfully',
      });
    } catch (error) {
      console.error('Error stopping downloads:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop downloads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromBlacklist = async (symbol: string) => {
    try {
      const response = await fetch('/api/market/remove-from-blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from blacklist');
      }
      
      toast({
        title: 'Success',
        description: `${symbol} removed from blacklist`,
      });
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from blacklist',
        variant: 'destructive',
      });
    }
  };

  // Loading state when no connection or data
  if (!isConnected || !downloadStatus) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">
          {!isConnected ? 'Connecting to server...' : 'Loading download status...'}
        </span>
      </div>
    );
  }

  const { overall_stats, active_downloads = [], queued_downloads = [], completed_downloads = [] } = downloadStatus;

  // Map the WebSocket data to match the table component interfaces
  const mappedActiveDownloads = active_downloads.map(download => ({
    ...download,
    time_remaining: formatDuration(download.estimated_remaining_seconds),
    time_remaining_seconds: download.estimated_remaining_seconds,
  }));

  const mappedQueuedDownloads = queued_downloads.map(download => ({
    symbol: download.symbol,
    position_in_queue: download.position,
  }));

  const mappedCompletedDownloads = completed_downloads.map(download => ({
    ...download,
    duration: formatDuration(download.duration),
  }));

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Download Dashboard</h1>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Concurrency"
              value={concurrencyInput}
              onChange={(e) => setConcurrencyInput(e.target.value)}
              className="w-32"
            />
            <Button onClick={startDownload} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Start Download
                </>
              )}
            </Button>
            <Button 
              onClick={stopDownloads} 
              variant="destructive" 
              disabled={loading || !overall_stats?.active_downloads}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Downloads
                </>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Download Overview</CardTitle>
            <CardDescription>
              Overall progress and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant={overall_stats?.active_downloads > 0 ? "default" : "secondary"}>
                    {overall_stats?.active_downloads > 0 ? (
                      <Clock className="mr-1 h-3 w-3" />
                    ) : (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    )}
                    {overall_stats?.active_downloads > 0 ? "Running" : "Idle"}
                  </Badge>
                  <span>Active: {overall_stats?.active_downloads ?? 0}</span>
                  <span>Queued: {overall_stats?.queued_downloads ?? 0}</span>
                  <span>Completed: {overall_stats?.completed_downloads ?? 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Symbol (optional)"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Active Downloads</div>
                  <div className="text-2xl font-bold">{overall_stats?.active_downloads ?? 0}</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Queued Downloads</div>
                  <div className="text-2xl font-bold">{overall_stats?.queued_downloads ?? 0}</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Completed Downloads</div>
                  <div className="text-2xl font-bold">{overall_stats?.completed_downloads ?? 0}</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Candles Per Second</div>
                  <div className="text-2xl font-bold">
                    {(overall_stats?.overall_candles_per_second ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Total Candles to Download</div>
                  <div className="text-2xl font-bold">
                    {overall_stats?.total_candles_to_download?.toLocaleString() ?? 0}
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Downloaded Candles</div>
                  <div className="text-2xl font-bold">
                    {overall_stats?.total_downloaded_candles?.toLocaleString() ?? 0}
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Progress</div>
                  <div className="text-2xl font-bold">
                    {overall_stats?.total_candles_to_download 
                      ? `${((overall_stats.total_downloaded_candles / overall_stats.total_candles_to_download) * 100).toFixed(2)}%`
                      : '0%'
                    }
                  </div>
                  <Progress 
                    value={overall_stats?.total_candles_to_download 
                      ? (overall_stats.total_downloaded_candles / overall_stats.total_candles_to_download) * 100
                      : 0
                    } 
                    className="mt-2"
                  />
                </div>
              </div>

              {overall_stats?.estimated_remaining_seconds > 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-medium">Estimated Time Remaining</div>
                  <div className="text-2xl font-bold">
                    {formatDuration(overall_stats.estimated_remaining_seconds)}
                  </div>
                </div>
              )}

              {overall_stats?.start_time && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium">Start Time</div>
                    <div className="text-xl">
                      {new Date(overall_stats.start_time).toLocaleString()}
                    </div>
                  </div>
                  {overall_stats?.end_time && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="font-medium">End Time</div>
                      <div className="text-xl">
                        {new Date(overall_stats.end_time).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active Downloads
              {mappedActiveDownloads.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {mappedActiveDownloads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="queued">
              Queued Downloads
              {mappedQueuedDownloads.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {mappedQueuedDownloads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed Downloads
              {mappedCompletedDownloads.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {mappedCompletedDownloads.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {mappedActiveDownloads.length > 0 ? (
              <ActiveDownloadsTable 
                downloads={mappedActiveDownloads}
                onRefresh={() => {}} // WebSocket auto-updates
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No active downloads
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="queued">
            {mappedQueuedDownloads.length > 0 ? (
              <QueuedDownloadsTable 
                downloads={mappedQueuedDownloads}
                onRefresh={() => {}} // WebSocket auto-updates
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No queued downloads
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="completed">
            {mappedCompletedDownloads.length > 0 ? (
              <CompletedDownloadsTable 
                downloads={mappedCompletedDownloads}
                onRefresh={() => {}} // WebSocket auto-updates
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No completed downloads
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
} 
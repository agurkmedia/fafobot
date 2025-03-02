'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AlertCircle, CheckCircle, Clock, Download, Loader2 } from 'lucide-react';
import { DownloadStatus } from '../../types/download';
import ActiveDownloadsTable from '../../components/dashboard/active-downloads-table';
import QueuedDownloadsTable from '../../components/dashboard/queued-downloads-table';
import CompletedDownloadsTable from '../../components/dashboard/completed-downloads-table';
import BlacklistedSymbolsTable from '../../components/dashboard/blacklisted-symbols-table';
import { useToast } from '../../components/ui/use-toast';

export default function DashboardPage() {
  const [status, setStatus] = useState<DownloadStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [concurrencyInput, setConcurrencyInput] = useState('10');
  const [symbolInput, setSymbolInput] = useState('');
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/market/download-status');
      if (!response.ok) {
        throw new Error('Failed to fetch download status');
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching download status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch download status',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
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
          concurrency: concurrency  // Only include concurrency
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
      
      fetchStatus();
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
      
      fetchStatus();
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
      
      fetchStatus();
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from blacklist',
        variant: 'destructive',
      });
    }
  };

  if (loading && !status) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading download status...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-xl">No download status available</span>
      </div>
    );
  }

  const { overview } = status;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Download Dashboard</h1>
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
            <Button onClick={stopDownloads} variant="destructive" disabled={loading || !status.overview.is_running}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                'Stop All'
              )}
            </Button>
          </div>
        </div>

        {status?.overview && (
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
                    <Badge variant={status.overview.is_running ? "default" : "secondary"}>
                      {status.overview.is_running ? (
                        <Clock className="mr-1 h-3 w-3" />
                      ) : (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {status.overview.is_running ? "Running" : "Idle"}
                    </Badge>
                    <span>Concurrency: {status.overview.concurrency_limit}</span>
                    <span>Completed: {status.overview.completed_symbols} / {status.overview.total_symbols}</span>
                    {status.overview.blacklisted_symbols_count > 0 && (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {status.overview.blacklisted_symbols_count} Blacklisted
                      </Badge>
                    )}
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

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {status.overview.progress_percent.toFixed(2)}%</span>
                    <span>
                      {status.overview.downloaded_candles.toLocaleString()} / {status.overview.total_candles.toLocaleString()} candles
                    </span>
                  </div>
                  <Progress value={status.overview.progress_percent} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium">Active Downloads</div>
                    <div className="text-2xl font-bold">{status.overview.active_downloads}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium">Queued Downloads</div>
                    <div className="text-2xl font-bold">{status.overview.queued_downloads}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium">Completed Downloads</div>
                    <div className="text-2xl font-bold">{status.overview.completed_downloads}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium">Candles Per Second</div>
                    <div className="text-2xl font-bold">{status.overview.overall_candles_per_second.toFixed(2)}</div>
                  </div>
                </div>

                {status.overview.is_running && (
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium">Estimated Time Remaining</div>
                    <div className="text-2xl font-bold">{status.overview.total_time_remaining}</div>
                    <div className="text-xs text-muted-foreground">
                      Queue completion estimate: {status.overview.queue_completion_estimate}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Elapsed time: {status.overview.global_elapsed_time}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active Downloads
              {status?.active_downloads.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {status.active_downloads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="queued">
              Queued Downloads
              {status?.queued_downloads.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {status.queued_downloads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed Downloads
              {status?.completed_downloads.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {status.completed_downloads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blacklisted">
              Blacklisted Symbols
              {status?.blacklisted_symbols.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {status.blacklisted_symbols.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {status?.active_downloads.length > 0 ? (
              <ActiveDownloadsTable downloads={status.active_downloads} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No active downloads
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="queued">
            {status?.queued_downloads.length > 0 ? (
              <QueuedDownloadsTable downloads={status.queued_downloads} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No queued downloads
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="completed">
            {status?.completed_downloads.length > 0 ? (
              <CompletedDownloadsTable downloads={status.completed_downloads} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No completed downloads
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="blacklisted">
            {status?.blacklisted_symbols.length > 0 ? (
              <BlacklistedSymbolsTable 
                symbols={status.blacklisted_symbols} 
                onRemove={removeFromBlacklist} 
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No blacklisted symbols
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
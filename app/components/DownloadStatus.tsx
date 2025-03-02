'use client';

import { useEffect } from 'react';
import { useWebSocketStore, type DownloadStatus } from '../lib/websocketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}

export function DownloadStatus() {
  const { isConnected, downloadStatus, connect, disconnect } = useWebSocketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  if (!isConnected || !downloadStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Download Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            {isConnected ? 'Waiting for data...' : 'Connecting to server...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { active_downloads, queued_downloads, completed_downloads, overall_stats } = downloadStatus;

  return (
    <div className="grid gap-4">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Downloads</p>
                <p className="text-2xl font-bold">{overall_stats.active_downloads}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Queued</p>
                <p className="text-2xl font-bold">{overall_stats.queued_downloads}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{overall_stats.completed_downloads}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Download Speed</p>
                <p className="text-2xl font-bold">{formatNumber(overall_stats.overall_candles_per_second)}/s</p>
              </div>
            </div>
            {overall_stats.estimated_remaining_seconds > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Estimated Time Remaining</p>
                <p className="text-lg font-semibold">
                  {formatDuration(overall_stats.estimated_remaining_seconds)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Downloads */}
      {active_downloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {active_downloads.map((download) => (
                <div key={download.symbol} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{download.symbol}</span>
                    <span className="text-sm text-muted-foreground">{download.progress}</span>
                  </div>
                  <Progress value={download.progress_percent} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatNumber(download.candles_per_second)} candles/s</span>
                    <span>ETA: {formatDuration(download.estimated_remaining_seconds)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue */}
      {queued_downloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Download Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {queued_downloads.map((download) => (
                  <div key={download.symbol} className="flex justify-between items-center">
                    <span>{download.symbol}</span>
                    <Badge variant="secondary">Position: {download.position}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Completed Downloads */}
      {completed_downloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {completed_downloads.map((download) => (
                  <div key={`${download.symbol}-${download.completed_at}`} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{download.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(download.completed_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {formatNumber(download.candles_per_second)} candles/s
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Downloaded: </span>
                        {formatNumber(download.downloaded_candles)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">New: </span>
                        {formatNumber(download.new_candles_added)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        {formatDuration(download.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
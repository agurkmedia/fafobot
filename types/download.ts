export interface DownloadOverview {
  active_downloads: number;
  queued_downloads: number;
  completed_downloads: number;
  blacklisted_downloads: number;
  total_symbols: number;
  concurrency_limit: number;
  is_running: boolean;
  total_remaining_candles: number;
  total_candles: number;
  downloaded_candles: number;
  progress_percent: number;
  total_time_remaining: string;
  total_time_remaining_seconds: number;
  overall_candles_per_second: number;
  completed_symbols: number;
  blacklisted_symbols_count: number;
  queue_completion_estimate: string;
  global_elapsed_time: string;
}

export interface ActiveDownload {
  symbol: string;
  progress: string;
  progress_percent: number;
  candles_per_second: number;
  remaining_candles: number;
  time_remaining: string;
  time_remaining_seconds: number;
  chunks_completed: number;
  total_chunks: number;
  new_candles_added: number;
  start_time: number;
  elapsed_time: string;
}

export interface QueuedDownload {
  symbol: string;
  position_in_queue: number;
}

export interface CompletedDownload {
  symbol: string;
  downloaded_candles: number;
  new_candles_added: number;
  duration: string;
  candles_per_second: number;
  completed_at: number;
}

export interface BlacklistedSymbol {
  symbol: string;
  reason: string;
}

export interface DownloadStatus {
  overview: DownloadOverview;
  active_downloads: ActiveDownload[];
  queued_downloads: QueuedDownload[];
  completed_downloads: CompletedDownload[];
  blacklisted_symbols: BlacklistedSymbol[];
} 
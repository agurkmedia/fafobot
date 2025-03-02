import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Clock, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ActiveDownloadStatus } from "@/app/lib/websocketService";

interface ActiveDownloadsTableProps {
  downloads: ActiveDownloadStatus[];
  onRefresh: () => void;
}

export default function ActiveDownloadsTable({ downloads }: ActiveDownloadsTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead className="w-[120px]">Elapsed</TableHead>
            <TableHead className="w-[120px]">Remaining</TableHead>
            <TableHead className="w-[100px]">Completes</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {downloads.map((download) => (
            <TableRow key={download.symbol}>
              <TableCell className="font-medium">{download.symbol}</TableCell>
              <TableCell>
                <div className="w-[200px]">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{download.chunks_completed}/{download.total_chunks} chunks</span>
                    <span>{download.progress_percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={download.progress_percent} />
                </div>
              </TableCell>
              <TableCell>{download.candles_per_second.toFixed(1)} c/s</TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Timer className="mr-1 h-4 w-4" />
                  {download.elapsed_time}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Clock className="mr-1 h-4 w-4" />
                  {download.time_remaining}
                </div>
              </TableCell>
              <TableCell>
                {download.estimated_completion}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">
                    {download.new_candles_added.toLocaleString()} / {download.total_candles.toLocaleString()} candles
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 
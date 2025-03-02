import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ActiveDownload } from "@/types/download";
import { TableSortHeader, SortDirection } from "@/components/ui/table-sort-header";

interface ActiveDownloadsTableProps {
  downloads: ActiveDownload[];
  onRefresh: () => void;
}

export default function ActiveDownloadsTable({ downloads, onRefresh }: ActiveDownloadsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedDownloads = useMemo(() => {
    if (!sortColumn) return downloads;

    return [...downloads].sort((a, b) => {
      const aValue = a[sortColumn as keyof ActiveDownload];
      const bValue = b[sortColumn as keyof ActiveDownload];
      
      // Handle different types of values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Default comparison for other types
      return sortDirection === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [downloads, sortColumn, sortDirection]);

  if (downloads.length === 0) {
    return <div className="text-center py-4">No active downloads</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableSortHeader 
              column="symbol" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Symbol
            </TableSortHeader>
            <TableSortHeader 
              column="progress_percent" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Progress
            </TableSortHeader>
            <TableSortHeader 
              column="candles_per_second" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Speed
            </TableSortHeader>
            <TableSortHeader 
              column="time_remaining_seconds" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Remaining
            </TableSortHeader>
            <TableSortHeader 
              column="elapsed_time" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Elapsed
            </TableSortHeader>
            <TableSortHeader 
              column="new_candles_added" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              New Candles
            </TableSortHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDownloads.map((download) => (
            <TableRow key={download.symbol}>
              <TableCell className="font-medium">{download.symbol}</TableCell>
              <TableCell>
                <div className="w-full max-w-xs">
                  <Progress value={download.progress_percent} className="h-2" />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {download.progress} ({download.progress_percent.toFixed(1)}%)
                  </div>
                </div>
              </TableCell>
              <TableCell>{download.candles_per_second.toFixed(1)} c/s</TableCell>
              <TableCell>{download.time_remaining}</TableCell>
              <TableCell>{download.elapsed_time}</TableCell>
              <TableCell>{download.new_candles_added.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
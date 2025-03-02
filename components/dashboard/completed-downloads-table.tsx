import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { CompletedDownload } from "@/types/download";
import { TableSortHeader, SortDirection } from "@/components/ui/table-sort-header";

interface CompletedDownloadsTableProps {
  downloads: CompletedDownload[];
  onRefresh: () => void;
}

export default function CompletedDownloadsTable({ downloads, onRefresh }: CompletedDownloadsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>("completed_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
      const aValue = a[sortColumn as keyof CompletedDownload];
      const bValue = b[sortColumn as keyof CompletedDownload];
      
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
    return <div className="text-center py-4">No completed downloads</div>;
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
              column="downloaded_candles" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Downloaded
            </TableSortHeader>
            <TableSortHeader 
              column="new_candles_added" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              New Candles
            </TableSortHeader>
            <TableSortHeader 
              column="duration" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Duration
            </TableSortHeader>
            <TableSortHeader 
              column="candles_per_second" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Speed
            </TableSortHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDownloads.map((download) => (
            <TableRow key={download.symbol}>
              <TableCell className="font-medium">{download.symbol}</TableCell>
              <TableCell>{download.downloaded_candles.toLocaleString()}</TableCell>
              <TableCell>{download.new_candles_added.toLocaleString()}</TableCell>
              <TableCell>{download.duration}</TableCell>
              <TableCell>{download.candles_per_second.toFixed(1)} c/s</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { QueuedDownload } from "@/types/download";
import { TableSortHeader, SortDirection } from "@/components/ui/table-sort-header";

interface QueuedDownloadsTableProps {
  downloads: QueuedDownload[];
  onRefresh: () => void;
}

export default function QueuedDownloadsTable({ downloads, onRefresh }: QueuedDownloadsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>("position_in_queue");
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
      const aValue = a[sortColumn as keyof QueuedDownload];
      const bValue = b[sortColumn as keyof QueuedDownload];
      
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
    return <div className="text-center py-4">No queued downloads</div>;
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
              column="position_in_queue" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Position in Queue
            </TableSortHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDownloads.map((download) => (
            <TableRow key={download.symbol}>
              <TableCell className="font-medium">{download.symbol}</TableCell>
              <TableCell>{download.position_in_queue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
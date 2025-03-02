import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BlacklistedSymbol } from "@/types/download";
import { TableSortHeader, SortDirection } from "@/components/ui/table-sort-header";

interface BlacklistedSymbolsTableProps {
  symbols: BlacklistedSymbol[];
  onRemove: (symbol: string) => void;
}

export default function BlacklistedSymbolsTable({ symbols, onRemove }: BlacklistedSymbolsTableProps) {
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

  const sortedSymbols = useMemo(() => {
    if (!sortColumn) return symbols;

    return [...symbols].sort((a, b) => {
      const aValue = a[sortColumn as keyof BlacklistedSymbol];
      const bValue = b[sortColumn as keyof BlacklistedSymbol];
      
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
  }, [symbols, sortColumn, sortDirection]);

  if (symbols.length === 0) {
    return <div className="text-center py-4">No blacklisted symbols</div>;
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
              column="reason" 
              currentSortColumn={sortColumn} 
              currentSortDirection={sortDirection} 
              onSort={handleSort}
            >
              Reason
            </TableSortHeader>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSymbols.map((symbol) => (
            <TableRow key={symbol.symbol}>
              <TableCell className="font-medium">{symbol.symbol}</TableCell>
              <TableCell>{symbol.reason}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onRemove(symbol.symbol)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
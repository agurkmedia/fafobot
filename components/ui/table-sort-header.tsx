import * as React from "react";
import { cn } from "../../lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "./table";

export type SortDirection = "asc" | "desc" | null;

interface TableSortHeaderProps extends React.HTMLAttributes<HTMLTableCellElement> {
  column: string;
  currentSortColumn: string | null;
  currentSortDirection: SortDirection;
  onSort: (column: string) => void;
}

export function TableSortHeader({
  column,
  currentSortColumn,
  currentSortDirection,
  onSort,
  children,
  className,
  ...props
}: TableSortHeaderProps) {
  const isActive = currentSortColumn === column;
  
  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none",
        isActive && "text-primary",
        className
      )}
      onClick={() => onSort(column)}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {isActive ? (
          currentSortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </div>
    </TableHead>
  );
} 
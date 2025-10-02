/**
 * Simplified transactions pagination component
 * Clean implementation with page controls
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PaginationInfo } from "@/lib/types";

interface TransactionsPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function TransactionsPaginationNew({
  pagination,
  onPageChange,
  loading,
}: TransactionsPaginationProps) {
  // Calculate range of items being shown
  const startItem =
    pagination.total_items === 0
      ? 0
      : (pagination.current_page - 1) * pagination.page_size + 1;
  const endItem = Math.min(
    pagination.current_page * pagination.page_size,
    pagination.total_items
  );

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.total_pages;
    const currentPage = pagination.current_page;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // Don't show pagination if only one page or no items
  if (pagination.total_pages <= 1) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Info */}
          <div className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {startItem}-{endItem}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {pagination.total_items}
            </span>{" "}
            {pagination.total_items === 1 ? "item" : "itens"}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("⬅️ Previous page clicked");
                onPageChange(pagination.current_page - 1);
              }}
              disabled={!pagination.has_previous || loading}
              className="h-9 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-1 text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }

                const pageNumber = page as number;
                const isCurrentPage = pageNumber === pagination.current_page;

                return (
                  <Button
                    key={pageNumber}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      console.log("📄 Page clicked:", pageNumber);
                      onPageChange(pageNumber);
                    }}
                    disabled={loading}
                    className={cn(
                      "h-9 w-9 p-0",
                      isCurrentPage && "pointer-events-none"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            {/* Current page indicator (mobile) */}
            <div className="sm:hidden text-sm text-muted-foreground">
              Página{" "}
              <span className="font-medium text-foreground">
                {pagination.current_page}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {pagination.total_pages}
              </span>
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("➡️ Next page clicked");
                onPageChange(pagination.current_page + 1);
              }}
              disabled={!pagination.has_next || loading}
              className="h-9 px-3"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


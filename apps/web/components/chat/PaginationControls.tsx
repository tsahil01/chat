"use client";

import { Separator } from "@workspace/ui/components/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@workspace/ui/components/pagination";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationControlsProps {
  pagination: PaginationInfo | null;
  currentPage: number;
  buildPageUrl: (page: number) => string;
}

export function PaginationControls({
  pagination,
  currentPage,
  buildPageUrl,
}: PaginationControlsProps) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <>
      <Separator />
      <div className="flex w-full items-center justify-between pb-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  pagination.hasPrevPage
                    ? buildPageUrl(currentPage - 1)
                    : undefined
                }
                className={
                  !pagination.hasPrevPage
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <PaginationItem>
                  <PaginationLink href={buildPageUrl(1)}>1</PaginationLink>
                </PaginationItem>
                {currentPage > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from(
              { length: Math.min(3, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 1) {
                  pageNum = pagination.totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }

                if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={buildPageUrl(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              },
            )}

            {/* Show last page */}
            {currentPage < pagination.totalPages - 2 && (
              <>
                {currentPage < pagination.totalPages - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink href={buildPageUrl(pagination.totalPages)}>
                    {pagination.totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href={
                  pagination.hasNextPage
                    ? buildPageUrl(currentPage + 1)
                    : undefined
                }
                className={
                  !pagination.hasNextPage
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}

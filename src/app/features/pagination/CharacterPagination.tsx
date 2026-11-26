import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPageItems } from "./pagination";
import { getHomeHref } from "@/app/features/filters/search";

interface CharacterPaginationProps {
  currentPage: number;
  totalPages: number;
  query?: string;
  basePath?: string;
}

export const CharacterPagination = ({
  currentPage,
  totalPages,
  query = "",
  basePath = "/",
}: CharacterPaginationProps) => {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) => getHomeHref({ basePath, query, page });
  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={pageHref(currentPage - 1)} />
          </PaginationItem>
        )}
        {pageItems.map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <PaginationLink
                href={pageHref(item)}
                isActive={item === currentPage}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={pageHref(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

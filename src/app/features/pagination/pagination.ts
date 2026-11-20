export type PageItem = number | "ellipsis-start" | "ellipsis-end";

export const PAGE_SIZE = 20;

export function parsePageNumber(
  value: string | string[] | number | null | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

// First, last, and a window of siblings around the current page.
export function getPageItems(
  current: number,
  total: number,
  siblings = 1,
): PageItem[] {
  if (total <= 0) return [];

  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const items: PageItem[] = [1];

  if (start > 2) items.push("ellipsis-start");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < total - 1) items.push("ellipsis-end");
  if (total > 1) items.push(total);

  return items;
}

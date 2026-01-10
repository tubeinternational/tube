export function buildPaginationPages(
  currentPage: number,
  totalPages: number,
  range = 2
): number[] {
  if (totalPages <= 1) return [];

  const start = Math.max(1, currentPage - range);
  const end = Math.min(totalPages, currentPage + range);

  return Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );
}

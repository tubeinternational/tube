export function buildPaginationPages(
  currentPage: number,
  totalPages: number,
  range = 2
): number[] {
  const safeTotalPages = Math.max(1, Math.floor(totalPages || 1));
  const safeCurrentPage = Math.min(
    Math.max(1, Math.floor(currentPage || 1)),
    safeTotalPages
  );
  const safeRange = Math.max(0, Math.floor(range));

  const start = Math.max(1, safeCurrentPage - safeRange);
  const end = Math.min(safeTotalPages, safeCurrentPage + safeRange);

  return Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );
}

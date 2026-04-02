function getPaginationMeta(page, limit, total) {
  const safeLimit = Math.max(Number(limit) || 25, 1);
  const safeTotal = Math.max(Number(total) || 0, 0);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
  const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages,
    offset: (safePage - 1) * safeLimit,
  };
}

module.exports = {
  getPaginationMeta,
};

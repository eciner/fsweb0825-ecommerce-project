export function calculateOffset(page, limit) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 25;
  return (safePage - 1) * safeLimit;
}

export function calculatePageCount(total, limit) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 25;
  return Math.ceil(safeTotal / safeLimit);
}

export function normalizePage(page, pageCount) {
  const parsed = Number.parseInt(String(page ?? ""), 10);
  const safePage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  if (!Number.isFinite(pageCount) || pageCount <= 0) {
    return 1;
  }

  if (safePage > pageCount) {
    return pageCount;
  }

  return safePage;
}

export function buildPaginationWindow(page, pageCount) {
  if (pageCount <= 1) {
    return [1].filter((value) => value <= pageCount);
  }

  const values = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...values]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  const result = [];
  for (let index = 0; index < pages.length; index += 1) {
    const current = pages[index];
    const previous = pages[index - 1];

    if (index > 0 && current - previous > 1) {
      result.push("...");
    }

    result.push(current);
  }

  return result;
}

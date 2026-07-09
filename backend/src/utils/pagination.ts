export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  query: Record<string, unknown>,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): PaginationResult {
  const { page: defaultPage = 1, limit: defaultLimit = 10, maxLimit = 50 } = defaults;

  const page = Math.max(parseInt(String(query.page ?? defaultPage), 10) || defaultPage, 1);
  const limit = Math.min(Math.max(parseInt(String(query.limit ?? defaultLimit), 10) || defaultLimit, 1), maxLimit);

  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) };
}

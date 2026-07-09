import { parsePagination, buildMeta } from '../../utils/pagination';

describe('parsePagination', () => {
  it('falls back to defaults when query params are missing', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it('parses valid page/limit query strings', () => {
    expect(parsePagination({ page: '3', limit: '20' })).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it('clamps page to a minimum of 1', () => {
    expect(parsePagination({ page: '-5' }).page).toBe(1);
    expect(parsePagination({ page: '0' }).page).toBe(1);
  });

  it('clamps limit to the configured maximum', () => {
    expect(parsePagination({ limit: '500' }, { maxLimit: 50 }).limit).toBe(50);
  });

  it('ignores non-numeric input and uses defaults', () => {
    expect(parsePagination({ page: 'abc', limit: 'xyz' })).toEqual({ page: 1, limit: 10, skip: 0 });
  });
});

describe('buildMeta', () => {
  it('computes totalPages correctly, rounding up', () => {
    expect(buildMeta(1, 10, 25)).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });

  it('returns at least 1 total page even when total is 0', () => {
    expect(buildMeta(1, 10, 0).totalPages).toBe(1);
  });
});

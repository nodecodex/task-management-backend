import { parsePagination, createPaginationMeta } from '../../src/utils/pagination.js';
import { PAGINATION } from '../../src/constants/index.js';

describe('Pagination Utilities', () => {
  describe('parsePagination', () => {
    it('should return default page and limit when parameters are missing', () => {
      const result = parsePagination();
      expect(result.page).toBe(PAGINATION.DEFAULT_PAGE);
      expect(result.limit).toBe(PAGINATION.DEFAULT_LIMIT);
      expect(result.skip).toBe(0);
    });

    it('should correctly parse valid page and limit strings', () => {
      const result = parsePagination('3', '15');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
      expect(result.skip).toBe(30);
    });

    it('should fallback to defaults when invalid negative numbers are provided', () => {
      const result = parsePagination('-5', '0');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(PAGINATION.DEFAULT_LIMIT);
      expect(result.skip).toBe(0);
    });

    it('should clamp limit to maxLimit when exceeded', () => {
      const result = parsePagination('1', '500');
      expect(result.limit).toBe(PAGINATION.MAX_LIMIT);
    });
  });

  describe('createPaginationMeta', () => {
    it('should create accurate metadata for multi-page results', () => {
      const meta = createPaginationMeta(100, 2, 20);
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(20);
      expect(meta.total).toBe(100);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should handle first page with no previous page', () => {
      const meta = createPaginationMeta(50, 1, 20);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should handle last page with no next page', () => {
      const meta = createPaginationMeta(50, 3, 20);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(true);
    });

    it('should handle zero total items gracefully', () => {
      const meta = createPaginationMeta(0, 1, 20);
      expect(meta.total).toBe(0);
      expect(meta.totalPages).toBe(0);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });
  });
});

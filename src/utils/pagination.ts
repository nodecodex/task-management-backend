import { PAGINATION } from '../constants/index.js';
import { PaginationMeta } from '../types/common.types.js';

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  rawPage?: unknown,
  rawLimit?: unknown,
  defaultLimit: number = PAGINATION.DEFAULT_LIMIT,
  maxLimit: number = PAGINATION.MAX_LIMIT
): ParsedPagination {
  let page = Number(rawPage);
  if (isNaN(page) || page < 1) {
    page = PAGINATION.DEFAULT_PAGE;
  }

  let limit = Number(rawLimit);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

export type PublicPaginationInput = {
  page: number;
  pageSize: number;
};

export type PublicPaginationWindow = PublicPaginationInput & {
  skip: number;
  take: number;
};

export type PublicPaginationMeta = PublicPaginationInput & {
  total: number;
  pageCount: number;
};

type PublicPaginationMetaInput = PublicPaginationInput & {
  total: number;
};

function assertInteger(value: number, field: string, min: number) {
  if (!Number.isInteger(value) || value < min) {
    throw new RangeError(`${field} must be an integer >= ${min}`);
  }
}

export function mapPublicPagination(input: PublicPaginationInput): PublicPaginationWindow {
  assertInteger(input.page, "page", 1);
  assertInteger(input.pageSize, "pageSize", 1);

  return {
    page: input.page,
    pageSize: input.pageSize,
    skip: (input.page - 1) * input.pageSize,
    take: input.pageSize,
  };
}

export function mapPublicPaginationMeta(input: PublicPaginationMetaInput): PublicPaginationMeta {
  assertInteger(input.page, "page", 1);
  assertInteger(input.pageSize, "pageSize", 1);
  assertInteger(input.total, "total", 0);

  return {
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    pageCount: input.total === 0 ? 0 : Math.ceil(input.total / input.pageSize),
  };
}

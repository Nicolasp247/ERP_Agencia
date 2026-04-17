export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
};

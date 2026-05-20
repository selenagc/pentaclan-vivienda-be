export interface PageRequest {
  page: number;
  limit: number;
  offset: number;
}

export interface SortRequest {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PageResult<T> {
  data: T[];
  total: number;
}

import type { PaginationMeta } from './PaginationMeta.js';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface ErrorResponseBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ErrorResponse {
  success: false;
  error: ErrorResponseBody;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

import type { Response } from "#shared/types";

export function createResponse<T>(
  status: { code: ResponseCode.Success; message?: string },
  data: T,
  meta?: { total: number; limit: number; offset: number },
): Response<T>;
export function createResponse(
  status: { code: Exclude<ResponseCode, ResponseCode.Success>; message?: string },
  data?: null,
): Response<never>;
export function createResponse<T>(
  status: { code: ResponseCode; message?: string },
  data?: T | null,
  meta?: { total: number; limit: number; offset: number },
): Response<T> {
  return {
    status: {
      code: status.code,
      message: status.message ?? "",
      requestId: crypto.randomUUID(),
      requestTime: Date.now(),
    },
    data: data ?? null,
    meta,
  } as Response<T>;
}

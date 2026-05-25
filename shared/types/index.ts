import type {
  users,
  episodes,
  episodeViews,
  genres,
  movieGenres,
  movies,
  movieViews,
  refreshTokens,
  seasons,
  seriesGenres,
  tvSeries,
} from "hub:db:schema";

type DateFields<T, K extends keyof T> = Omit<T, K> & { [P in K]: string | null };

export type User = DateFields<typeof users.$inferSelect, "createdAt" | "updatedAt">;
export type Genre = DateFields<typeof genres.$inferSelect, "createdAt">;
export type Movie = DateFields<typeof movies.$inferSelect, "createdAt" | "updatedAt">;
export type TVSeries = DateFields<typeof tvSeries.$inferSelect, "createdAt" | "updatedAt">;
export type Season = DateFields<typeof seasons.$inferSelect, "createdAt" | "updatedAt">;
export type Episode = DateFields<typeof episodes.$inferSelect, "createdAt" | "updatedAt">;
export type EpisodeView = DateFields<typeof episodeViews.$inferSelect, "viewedAt">;
export type MovieGenre = typeof movieGenres.$inferSelect;
export type SeriesGenre = typeof seriesGenres.$inferSelect;
export type MovieView = DateFields<typeof movieViews.$inferSelect, "viewedAt">;
export type RefreshToken = DateFields<
  typeof refreshTokens.$inferSelect,
  "createdAt" | "expiresAt" | "revokedAt"
>;

export enum ResponseCode {
  Success = "SUCCESS",
  Error = "ERROR",
  NotFound = "NOT_FOUND",
  ValidationError = "VALIDATION_ERROR",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  InvalidRequest = "INVALID_REQUEST",
  InternalError = "INTERNAL_ERROR",
}

export interface ResponseStatus {
  code: ResponseCode;
  message: string;
  requestId: string;
  requestTime: number;
}

export type ResponseSuccess<T> = {
  status: ResponseStatus & { code: ResponseCode.Success };
  data: T;
  meta?: { total: number; limit: number; offset: number };
};

export type ResponseError = {
  status: ResponseStatus & { code: Exclude<ResponseCode, ResponseCode.Success> };
  data: null;
};

export type Response<T> = ResponseSuccess<T> | ResponseError;

export function isSuccessResponse<T>(res: Response<T>): res is ResponseSuccess<T> {
  return res.status.code === ResponseCode.Success;
}

export enum CookieName {
  AccessToken = "access_token",
  RefreshToken = "refresh_token",
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  name: string;
}

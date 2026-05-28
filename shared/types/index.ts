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
  watchlist,
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
export type WatchlistItem = DateFields<typeof watchlist.$inferSelect, "createdAt">;
export type ContentType = "movie" | "series";

export interface ContinueWatchingItem {
  contentType: ContentType;
  contentId: string;
  title: string;
  poster: string | null;
  thumbnail: string | null;
  progressSeconds: number | null;
  duration: number | null;
  progressPercent: number;
  viewedAt: string | null;
}
export type RefreshToken = DateFields<
  typeof refreshTokens.$inferSelect,
  "createdAt" | "expiresAt" | "revokedAt"
>;

export enum ApiResponseCode {
  Success = "SUCCESS",
  Error = "ERROR",
  NotFound = "NOT_FOUND",
  ValidationError = "VALIDATION_ERROR",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  InvalidRequest = "INVALID_REQUEST",
  InternalError = "INTERNAL_ERROR",
}

export interface ApiResponseStatus {
  code: ApiResponseCode;
  message: string;
  requestId: string;
  requestTime: number;
}

export type ApiResponseSuccess<T> = {
  status: ApiResponseStatus & { code: ApiResponseCode.Success };
  data: T;
  meta?: { total: number; limit: number; offset: number };
};

export type ApiResponseError = {
  status: ApiResponseStatus & { code: Exclude<ApiResponseCode, ApiResponseCode.Success> };
  data: null;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export function isSuccessResponse<T>(res?: ApiResponse<T>): res is ApiResponseSuccess<T> {
  return !!res && res.status.code === ApiResponseCode.Success;
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

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

export type User = typeof users.$inferSelect;
export type Genre = typeof genres.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type TVSeries = typeof tvSeries.$inferSelect;
export type Season = typeof seasons.$inferSelect;
export type Episode = typeof episodes.$inferSelect;
export type EpisodeView = typeof episodeViews.$inferSelect;
export type MovieGenre = typeof movieGenres.$inferSelect;
export type SeriesGenre = typeof seriesGenres.$inferSelect;
export type MovieView = typeof movieViews.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;

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

export interface Response<T> {
  status: {
    code: ResponseCode;
    message: string;
    requestId: string;
    requestTime: number;
  };
  data: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

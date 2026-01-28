import type {
  users,
  episodes,
  episodeViews,
  genres,
  movieGenres,
  movies,
  movieViews,
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

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

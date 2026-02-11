import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const genres = pgTable("genres", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const movies = pgTable(
  "movies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    thumbnail: varchar("thumbnail", { length: 1000 }),
    poster: varchar("poster", { length: 1000 }),
    duration: integer("duration"),
    embedUrl: varchar("embed_url", { length: 1000 }).notNull(),
    embedType: varchar("embed_type", { length: 50 }).notNull(),
    releaseYear: integer("release_year"),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    featured: boolean("featured").default(false),
    status: varchar("status", { length: 50 }).default("active"), // 'active', 'draft', 'archived'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
  },
  (table) => [
    index("idx_movies_status").on(table.status),
    index("idx_movies_featured").on(table.featured),
  ],
);

export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [index("movie_genres_pk").on(table.movieId, table.genreId)],
);

export const movieViews = pgTable("movie_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  movieId: uuid("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow(),
  progressSeconds: integer("progress_seconds"),
  completed: boolean("completed").default(false),
});

export const tvSeries = pgTable(
  "tv_series",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    thumbnail: varchar("thumbnail", { length: 1000 }),
    poster: varchar("poster", { length: 1000 }),
    firstAiredYear: integer("first_aired_year"),
    lastAiredYear: integer("last_aired_year"),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    featured: boolean("featured").default(false),
    status: varchar("status", { length: 50 }).default("ongoing"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
  },
  (table) => [
    index("idx_tv_series_status").on(table.status),
    index("idx_tv_series_featured").on(table.featured),
  ],
);

export const seriesGenres = pgTable(
  "series_genres",
  {
    seriesId: uuid("series_id")
      .notNull()
      .references(() => tvSeries.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [index("series_genres_pk").on(table.seriesId, table.genreId)],
);

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  seriesId: uuid("series_id")
    .notNull()
    .references(() => tvSeries.id, { onDelete: "cascade" }),
  seasonNumber: integer("season_number").notNull(),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  thumbnail: varchar("thumbnail", { length: 1000 }),
  releaseYear: integer("release_year"),
  episodeCount: integer("episode_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const episodes = pgTable("episodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  episodeNumber: integer("episode_number").notNull(),
  duration: integer("duration"),
  embedUrl: varchar("embed_url", { length: 1000 }).notNull(),
  embedType: varchar("embed_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const episodeViews = pgTable("episode_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  episodeId: uuid("episode_id")
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow(),
  sessionId: varchar("session_id", { length: 255 }),
  progressSeconds: integer("progress_seconds"),
  completed: boolean("completed").default(false),
});

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 500 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("idx_refresh_tokens_user").on(table.userId),
    index("idx_refresh_tokens_token").on(table.token),
    index("idx_refresh_tokens_expires").on(table.expiresAt),
    index("idx_refresh_tokens_revoked").on(table.revokedAt),
  ],
);

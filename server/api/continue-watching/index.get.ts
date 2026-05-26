import { db, schema } from "@nuxthub/db";
import { eq, desc, and, gt } from "drizzle-orm";
import { ApiResponseCode, type ContinueWatchingItem } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
        null,
      );
    }

    const query = getQuery(event);
    const limit = Math.min(Number(query.limit) || 10, 20);

    const movieViewsList = await db
      .select({
        contentId: schema.movieViews.movieId,
        progressSeconds: schema.movieViews.progressSeconds,
        duration: schema.movies.duration,
        viewedAt: schema.movieViews.viewedAt,
        completed: schema.movieViews.completed,
        title: schema.movies.title,
        poster: schema.movies.poster,
        thumbnail: schema.movies.thumbnail,
      })
      .from(schema.movieViews)
      .innerJoin(schema.movies, eq(schema.movieViews.movieId, schema.movies.id))
      .where(
        and(
          eq(schema.movieViews.userId, userId),
          eq(schema.movieViews.completed, false),
          gt(schema.movieViews.progressSeconds, 0),
        ),
      )
      .orderBy(desc(schema.movieViews.viewedAt))
      .limit(limit);

    const episodeViewsList = await db
      .select({
        contentId: schema.episodeViews.episodeId,
        progressSeconds: schema.episodeViews.progressSeconds,
        duration: schema.episodes.duration,
        viewedAt: schema.episodeViews.viewedAt,
        completed: schema.episodeViews.completed,
        title: schema.tvSeries.title,
        poster: schema.tvSeries.poster,
        thumbnail: schema.tvSeries.thumbnail,
        seriesId: schema.tvSeries.id,
      })
      .from(schema.episodeViews)
      .innerJoin(schema.episodes, eq(schema.episodeViews.episodeId, schema.episodes.id))
      .innerJoin(schema.seasons, eq(schema.episodes.seasonId, schema.seasons.id))
      .innerJoin(schema.tvSeries, eq(schema.seasons.seriesId, schema.tvSeries.id))
      .where(
        and(
          eq(schema.episodeViews.userId, userId),
          eq(schema.episodeViews.completed, false),
          gt(schema.episodeViews.progressSeconds, 0),
        ),
      )
      .orderBy(desc(schema.episodeViews.viewedAt))
      .limit(limit);

    const movieItems: ContinueWatchingItem[] = movieViewsList.map((v) => {
      const progressPercent =
        v.duration && v.duration > 0
          ? Math.min(((v.progressSeconds ?? 0) / (v.duration * 60)) * 100, 100)
          : 0;
      return {
        contentType: "movie" as const,
        contentId: v.contentId,
        title: v.title,
        poster: v.poster,
        thumbnail: v.thumbnail,
        progressSeconds: v.progressSeconds ?? null,
        duration: v.duration ? v.duration * 60 : null,
        progressPercent,
        viewedAt: v.viewedAt ? new Date(v.viewedAt).toISOString() : null,
      };
    });

    const episodeItems: ContinueWatchingItem[] = episodeViewsList.map((v) => {
      const progressPercent =
        v.duration && v.duration > 0
          ? Math.min(((v.progressSeconds ?? 0) / (v.duration * 60)) * 100, 100)
          : 0;
      return {
        contentType: "series" as const,
        contentId: v.seriesId!,
        title: v.title,
        poster: v.poster,
        thumbnail: v.thumbnail,
        progressSeconds: v.progressSeconds ?? null,
        duration: v.duration ? v.duration * 60 : null,
        progressPercent,
        viewedAt: v.viewedAt ? new Date(v.viewedAt).toISOString() : null,
      };
    });

    const allItems = [...movieItems, ...episodeItems]
      .sort((a, b) => {
        const dateA = a.viewedAt ? new Date(a.viewedAt).getTime() : 0;
        const dateB = b.viewedAt ? new Date(b.viewedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    return createResponse({ code: ApiResponseCode.Success }, allItems);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch continue watching" },
      null,
    );
  }
});

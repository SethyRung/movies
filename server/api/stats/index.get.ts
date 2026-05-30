import { db, schema } from "@nuxthub/db";
import { and, eq, desc, sql } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const genreLimit = Math.min(Number(query.genreLimit) || 20, 100);

    const [
      featuredMovies,
      featuredSeries,
      trendingMovies,
      trendingSeries,
      newMovies,
      newSeries,
      genres,
      totalMovies,
      totalSeries,
    ] = await Promise.all([
      db
        .select()
        .from(schema.movies)
        .where(and(eq(schema.movies.status, "active"), eq(schema.movies.featured, true)))
        .orderBy(desc(schema.movies.createdAt))
        .limit(1),

      db
        .select()
        .from(schema.tvSeries)
        .where(and(eq(schema.tvSeries.status, "ongoing"), eq(schema.tvSeries.featured, true)))
        .orderBy(desc(schema.tvSeries.createdAt))
        .limit(1),

      db
        .select()
        .from(schema.movies)
        .where(eq(schema.movies.status, "active"))
        .orderBy(desc(schema.movies.rating))
        .limit(4),

      db
        .select()
        .from(schema.tvSeries)
        .where(eq(schema.tvSeries.status, "ongoing"))
        .orderBy(desc(schema.tvSeries.rating))
        .limit(4),

      db
        .select()
        .from(schema.movies)
        .where(eq(schema.movies.status, "active"))
        .orderBy(desc(schema.movies.createdAt))
        .limit(10),

      db
        .select()
        .from(schema.tvSeries)
        .where(eq(schema.tvSeries.status, "ongoing"))
        .orderBy(desc(schema.tvSeries.createdAt))
        .limit(10),

      db.select().from(schema.genres).orderBy(schema.genres.name).limit(genreLimit),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.movies)
        .where(eq(schema.movies.status, "active")),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.tvSeries)
        .where(eq(schema.tvSeries.status, "ongoing")),
    ]);

    return createResponse(
      { code: ApiResponseCode.Success },
      {
        featuredMovies,
        featuredSeries,
        trendingMovies,
        trendingSeries,
        newMovies,
        newSeries,
        genres,
        totalMovies: totalMovies[0]?.count ?? 0,
        totalSeries: totalSeries[0]?.count ?? 0,
      },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch homepage stats" },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const status = query.status ? (query.status as string) : undefined;
    const featured =
      query.featured === "true" ? true : query.featured === "false" ? false : undefined;
    const search = (query.search as string) || "";
    const sortBy = (query.sortBy as string) || "createdAt";
    const sortOrder = (query.sortOrder as string) || "desc";
    const genreParam = query.genre as string | undefined;

    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(schema.tvSeries.status, status));
    }

    if (featured !== undefined) {
      conditions.push(eq(schema.tvSeries.featured, featured));
    }

    if (search) {
      conditions.push(
        sql`(${schema.tvSeries.title} ILIKE ${"%" + search + "%"} OR ${schema.tvSeries.description} ILIKE ${"%" + search + "%"})`,
      );
    }

    const whereClause =
      conditions.length > 1
        ? and(...conditions)
        : conditions.length === 1
          ? conditions[0]
          : undefined;

    const orderByColumn =
      sortBy === "title"
        ? schema.tvSeries.title
        : sortBy === "rating"
          ? schema.tvSeries.rating
          : sortBy === "firstAiredYear"
            ? schema.tvSeries.firstAiredYear
            : schema.tvSeries.createdAt;

    const orderByClause = sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

    if (genreParam) {
      const genreIds = genreParam.split(",").filter(Boolean);

      const countResult = await db
        .select({ count: sql<number>`count(distinct ${schema.tvSeries.id})::int` })
        .from(schema.tvSeries)
        .innerJoin(schema.seriesGenres, eq(schema.tvSeries.id, schema.seriesGenres.seriesId))
        .where(
          whereClause
            ? and(whereClause, inArray(schema.seriesGenres.genreId, genreIds))
            : inArray(schema.seriesGenres.genreId, genreIds),
        );

      const total = countResult[0]?.count || 0;

      const series = await db
        .selectDistinctOn([schema.tvSeries.id], { series: schema.tvSeries })
        .from(schema.tvSeries)
        .innerJoin(schema.seriesGenres, eq(schema.tvSeries.id, schema.seriesGenres.seriesId))
        .where(
          whereClause
            ? and(whereClause, inArray(schema.seriesGenres.genreId, genreIds))
            : inArray(schema.seriesGenres.genreId, genreIds),
        )
        .orderBy(schema.tvSeries.id, orderByClause)
        .limit(limit)
        .offset(offset);

      return createResponse(
        { code: ApiResponseCode.Success },
        series.map((s) => s.series),
        {
          total,
          limit,
          offset,
        },
      );
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.tvSeries)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const series = await db
      .select()
      .from(schema.tvSeries)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return createResponse({ code: ApiResponseCode.Success }, series, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch series" },
      null,
    );
  }
});

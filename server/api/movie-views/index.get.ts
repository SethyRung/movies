import { db, schema } from "@nuxthub/db";
import { eq, desc, sql } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const movieId = query.movieId as string | undefined;
    const completed =
      query.completed === "true"
        ? true
        : query.completed === "false"
          ? false
          : undefined;
    const sortBy = (query.sortBy as string) || "viewedAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const conditions: any[] = [];

    if (movieId) {
      conditions.push(eq(schema.movieViews.movieId, movieId));
    }

    if (completed !== undefined) {
      conditions.push(eq(schema.movieViews.completed, completed));
    }

    const whereClause =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : sql`${conditions.join(" AND ")}`
        : undefined;

    const orderByColumn =
      sortBy === "viewedAt"
        ? schema.movieViews.viewedAt
        : sortBy === "progressSeconds"
          ? schema.movieViews.progressSeconds
          : schema.movieViews.viewedAt;

    const orderByClause =
      sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.movieViews)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const movieViews = await db
      .select()
      .from(schema.movieViews)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return createResponse({ code: ResponseCode.Success }, movieViews, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to fetch movie views",
      },
      null,
    );
  }
});

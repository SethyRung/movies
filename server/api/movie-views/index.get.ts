import { db, schema } from "@nuxthub/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse({ code: ApiResponseCode.Unauthorized, message: "Unauthorized" }, null);
    }

    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const movieId = query.movieId as string | undefined;
    const completed =
      query.completed === "true" ? true : query.completed === "false" ? false : undefined;
    const sortBy = (query.sortBy as string) || "viewedAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const conditions = [eq(schema.movieViews.userId, userId)];

    if (movieId) {
      conditions.push(eq(schema.movieViews.movieId, movieId));
    }

    if (completed !== undefined) {
      conditions.push(eq(schema.movieViews.completed, completed));
    }

    const whereClause = and(...conditions);

    const orderByColumn =
      sortBy === "viewedAt"
        ? schema.movieViews.viewedAt
        : sortBy === "progressSeconds"
          ? schema.movieViews.progressSeconds
          : schema.movieViews.viewedAt;

    const orderByClause = sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

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

    return createResponse({ code: ApiResponseCode.Success }, movieViews, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to fetch movie views",
      },
      null,
    );
  }
});

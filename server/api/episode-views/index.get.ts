import { db, schema } from "@nuxthub/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not found in context" },
        null,
      );
    }

    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const episodeId = query.episodeId as string | undefined;
    const sessionId = query.sessionId as string | undefined;
    const completed =
      query.completed === "true" ? true : query.completed === "false" ? false : undefined;
    const sortBy = (query.sortBy as string) || "viewedAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const conditions: any[] = [eq(schema.episodeViews.userId, userId)];

    if (episodeId) {
      conditions.push(eq(schema.episodeViews.episodeId, episodeId));
    }

    if (sessionId) {
      conditions.push(eq(schema.episodeViews.sessionId, sessionId));
    }

    if (completed !== undefined) {
      conditions.push(eq(schema.episodeViews.completed, completed));
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const orderByColumn =
      sortBy === "viewedAt"
        ? schema.episodeViews.viewedAt
        : sortBy === "progressSeconds"
          ? schema.episodeViews.progressSeconds
          : schema.episodeViews.viewedAt;

    const orderByClause = sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.episodeViews)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const episodeViews = await db
      .select()
      .from(schema.episodeViews)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return createResponse({ code: ApiResponseCode.Success }, episodeViews, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to fetch episode views",
      },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq, desc, sql } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const episodeId = query.episodeId as string | undefined;
    const sessionId = query.sessionId as string | undefined;
    const completed =
      query.completed === "true"
        ? true
        : query.completed === "false"
          ? false
          : undefined;
    const sortBy = (query.sortBy as string) || "viewedAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const conditions: any[] = [];

    if (episodeId) {
      conditions.push(eq(schema.episodeViews.episodeId, episodeId));
    }

    if (sessionId) {
      conditions.push(eq(schema.episodeViews.sessionId, sessionId));
    }

    if (completed !== undefined) {
      conditions.push(eq(schema.episodeViews.completed, completed));
    }

    const whereClause =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : sql`${conditions.join(" AND ")}`
        : undefined;

    const orderByColumn =
      sortBy === "viewedAt"
        ? schema.episodeViews.viewedAt
        : sortBy === "progressSeconds"
          ? schema.episodeViews.progressSeconds
          : schema.episodeViews.viewedAt;

    const orderByClause =
      sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

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

    return createResponse({ code: ResponseCode.Success }, episodeViews, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to fetch episode views",
      },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const status = (query.status as string) || "ongoing";
    const featured =
      query.featured === "true" ? true : query.featured === "false" ? false : undefined;
    const search = (query.search as string) || "";
    const sortBy = (query.sortBy as string) || "createdAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const conditions: any[] = [eq(schema.tvSeries.status, status)];

    if (featured !== undefined) {
      conditions.push(eq(schema.tvSeries.featured, featured));
    }

    if (search) {
      conditions.push(
        sql`(${schema.tvSeries.title} ILIKE ${"%" + search + "%"} OR ${schema.tvSeries.description} ILIKE ${"%" + search + "%"})`,
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const orderByColumn =
      sortBy === "title"
        ? schema.tvSeries.title
        : sortBy === "rating"
          ? schema.tvSeries.rating
          : sortBy === "firstAiredYear"
            ? schema.tvSeries.firstAiredYear
            : schema.tvSeries.createdAt;

    const orderByClause = sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

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

    return createResponse({ code: ResponseCode.Success }, series, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch series" },
      null,
    );
  }
});

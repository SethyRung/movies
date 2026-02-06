import { db, schema } from "@nuxthub/db";
import { desc, sql } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    const search = (query.search as string) || "";
    const sortBy = (query.sortBy as string) || "name";
    const sortOrder = (query.sortOrder as string) || "asc";

    let whereClause: any = undefined;

    if (search) {
      whereClause = sql`(${schema.genres.name} ILIKE ${"%" + search + "%"} OR ${schema.genres.slug} ILIKE ${"%" + search + "%"})`;
    }

    const orderByColumn =
      sortBy === "name"
        ? schema.genres.name
        : sortBy === "slug"
          ? schema.genres.slug
          : schema.genres.createdAt;

    const orderByClause = sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.genres)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const genres = await db
      .select()
      .from(schema.genres)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return createResponse({ code: ResponseCode.Success }, genres, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch genres" },
      null,
    );
  }
});

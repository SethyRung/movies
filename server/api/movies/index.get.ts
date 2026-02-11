import { db, schema } from "@nuxthub/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const status = (query.status as string) || "active";
    const featured =
      query.featured === "true" ? true : query.featured === "false" ? false : undefined;
    const search = (query.search as string) || "";
    const sortBy = (query.sortBy as string) || "createdAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const conditions: any[] = [eq(schema.movies.status, status)];

    if (featured !== undefined) {
      conditions.push(eq(schema.movies.featured, featured));
    }

    if (search) {
      conditions.push(
        sql`(${schema.movies.title} ILIKE ${"%" + search + "%"} OR ${schema.movies.description} ILIKE ${"%" + search + "%"})`,
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const orderByColumn =
      sortBy === "title"
        ? schema.movies.title
        : sortBy === "rating"
          ? schema.movies.rating
          : sortBy === "releaseYear"
            ? schema.movies.releaseYear
            : schema.movies.createdAt;

    const orderByClause = sortOrder === "asc" ? orderByColumn : desc(orderByColumn);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.movies)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const movies = await db
      .select()
      .from(schema.movies)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return createResponse({ code: ResponseCode.Success }, movies, {
      total,
      limit,
      offset,
    });
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch movies" },
      null,
    );
  }
});

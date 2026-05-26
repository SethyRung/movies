import { db, schema } from "@nuxthub/db";
import { eq, desc, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

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
    const contentType = query.contentType as string | undefined;

    const conditions = [eq(schema.watchlist.userId, userId)];

    if (contentType) {
      conditions.push(eq(schema.watchlist.contentType, contentType));
    }

    const items = await db
      .select()
      .from(schema.watchlist)
      .where(conditions.length === 1 ? conditions[0]! : and(...conditions))
      .orderBy(desc(schema.watchlist.createdAt));

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let content: { title: string; poster: string | null; thumbnail: string | null } | null =
          null;

        if (item.contentType === "movie") {
          const movie = await db
            .select({
              title: schema.movies.title,
              poster: schema.movies.poster,
              thumbnail: schema.movies.thumbnail,
            })
            .from(schema.movies)
            .where(eq(schema.movies.id, item.contentId))
            .limit(1);
          content = movie[0] ?? null;
        } else {
          const series = await db
            .select({
              title: schema.tvSeries.title,
              poster: schema.tvSeries.poster,
              thumbnail: schema.tvSeries.thumbnail,
            })
            .from(schema.tvSeries)
            .where(eq(schema.tvSeries.id, item.contentId))
            .limit(1);
          content = series[0] ?? null;
        }

        return {
          ...item,
          title: content?.title ?? "Unknown",
          poster: content?.poster ?? null,
          thumbnail: content?.thumbnail ?? null,
        };
      }),
    );

    return createResponse({ code: ApiResponseCode.Success }, enrichedItems);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch watchlist" },
      null,
    );
  }
});

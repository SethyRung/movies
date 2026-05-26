import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
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
    const contentType = query.contentType as string;
    const contentId = query.contentId as string;

    if (!contentType || !contentId) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "contentType and contentId are required",
        },
        null,
      );
    }

    const existing = await db
      .select({ id: schema.watchlist.id })
      .from(schema.watchlist)
      .where(
        and(
          eq(schema.watchlist.userId, userId),
          eq(schema.watchlist.contentType, contentType),
          eq(schema.watchlist.contentId, contentId),
        ),
      )
      .limit(1);

    return createResponse(
      { code: ApiResponseCode.Success },
      { inWatchlist: existing.length > 0, watchlistId: existing[0]?.id ?? null },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to check watchlist" },
      null,
    );
  }
});

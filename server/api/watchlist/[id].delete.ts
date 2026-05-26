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

    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Watchlist item ID is required" },
        null,
      );
    }

    const existing = await db
      .select()
      .from(schema.watchlist)
      .where(and(eq(schema.watchlist.id, id), eq(schema.watchlist.userId, userId)))
      .limit(1);

    if (!existing.length) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Watchlist item not found" },
        null,
      );
    }

    await db.delete(schema.watchlist).where(eq(schema.watchlist.id, id));

    return createResponse({ code: ApiResponseCode.Success }, { id });
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to remove from watchlist" },
      null,
    );
  }
});

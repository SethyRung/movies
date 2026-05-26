import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
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

    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        {
          code: ApiResponseCode.InvalidRequest,
          message: "Episode view ID is required",
        },
        null,
      );
    }

    const existing = await db
      .select()
      .from(schema.episodeViews)
      .where(and(eq(schema.episodeViews.id, id), eq(schema.episodeViews.userId, userId)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Episode view not found" },
        null,
      );
    }

    await db.delete(schema.episodeViews).where(eq(schema.episodeViews.id, id));

    return createResponse({ code: ApiResponseCode.Success }, { id });
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to delete episode view",
      },
      null,
    );
  }
});

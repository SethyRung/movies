import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        {
          code: ResponseCode.InvalidRequest,
          message: "Episode view ID is required",
        },
        null,
      );
    }

    const existing = await db
      .select()
      .from(schema.episodeViews)
      .where(eq(schema.episodeViews.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse(
        { code: ResponseCode.NotFound, message: "Episode view not found" },
        null,
      );
    }

    await db.delete(schema.episodeViews).where(eq(schema.episodeViews.id, id));

    return createResponse({ code: ResponseCode.Success }, { id });
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to delete episode view",
      },
      null,
    );
  }
});

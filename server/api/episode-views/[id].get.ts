import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
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

    const episodeView = await db
      .select()
      .from(schema.episodeViews)
      .where(eq(schema.episodeViews.id, id))
      .limit(1);

    if (!episodeView || episodeView.length === 0) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Episode view not found" },
        null,
      );
    }

    return createResponse({ code: ApiResponseCode.Success }, episodeView[0]);
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to fetch episode view",
      },
      null,
    );
  }
});

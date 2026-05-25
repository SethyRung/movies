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
          message: "Movie view ID is required",
        },
        null,
      );
    }

    const movieView = await db
      .select()
      .from(schema.movieViews)
      .where(eq(schema.movieViews.id, id))
      .limit(1);

    if (!movieView || movieView.length === 0) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Movie view not found" },
        null,
      );
    }

    return createResponse({ code: ApiResponseCode.Success }, movieView[0]);
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to fetch movie view",
      },
      null,
    );
  }
});

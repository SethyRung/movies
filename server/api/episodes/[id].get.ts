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
          message: "Episode ID is required",
        },
        null,
      );
    }

    const episode = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.id, id))
      .limit(1);

    if (!episode || episode.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Episode not found" }, null);
    }

    return createResponse({ code: ApiResponseCode.Success }, episode[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch episode" },
      null,
    );
  }
});

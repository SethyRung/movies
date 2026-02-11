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
      return createResponse({ code: ResponseCode.NotFound, message: "Episode not found" }, null);
    }

    return createResponse({ code: ResponseCode.Success }, episode[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch episode" },
      null,
    );
  }
});

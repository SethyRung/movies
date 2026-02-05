import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Season ID is required" },
        null,
      );
    }

    const season = await db
      .select()
      .from(schema.seasons)
      .where(eq(schema.seasons.id, id))
      .limit(1);

    if (!season || season.length === 0) {
      return createResponse(
        { code: ResponseCode.NotFound, message: "Season not found" },
        null,
      );
    }

    return createResponse({ code: ResponseCode.Success }, season[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch season" },
      null,
    );
  }
});

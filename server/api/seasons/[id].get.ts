import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Season ID is required" },
        null,
      );
    }

    const season = await db.select().from(schema.seasons).where(eq(schema.seasons.id, id)).limit(1);

    if (!season || season.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Season not found" }, null);
    }

    return createResponse({ code: ApiResponseCode.Success }, season[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch season" },
      null,
    );
  }
});

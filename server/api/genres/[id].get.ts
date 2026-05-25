import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Genre ID is required" },
        null,
      );
    }

    const genre = await db.select().from(schema.genres).where(eq(schema.genres.id, id)).limit(1);

    if (!genre || genre.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Genre not found" }, null);
    }

    return createResponse({ code: ApiResponseCode.Success }, genre[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch genre" },
      null,
    );
  }
});

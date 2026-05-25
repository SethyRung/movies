import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Movie ID is required" },
        null,
      );
    }

    const existing = await db.select().from(schema.movies).where(eq(schema.movies.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Movie not found" }, null);
    }

    await db.delete(schema.movies).where(eq(schema.movies.id, id));

    return createResponse({ code: ApiResponseCode.Success }, { id });
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to delete movie" },
      null,
    );
  }
});

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

    const existing = await db.select().from(schema.genres).where(eq(schema.genres.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Genre not found" }, null);
    }

    await db.delete(schema.genres).where(eq(schema.genres.id, id));

    return createResponse({ code: ApiResponseCode.Success }, { id });
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to delete genre" },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Genre ID is required" },
        null,
      );
    }

    const genre = await db.select().from(schema.genres).where(eq(schema.genres.id, id)).limit(1);

    if (!genre || genre.length === 0) {
      return createResponse({ code: ResponseCode.NotFound, message: "Genre not found" }, null);
    }

    return createResponse({ code: ResponseCode.Success }, genre[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch genre" },
      null,
    );
  }
});

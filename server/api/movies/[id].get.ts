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

    const movie = await db.select().from(schema.movies).where(eq(schema.movies.id, id)).limit(1);

    if (!movie || movie.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Movie not found" }, null);
    }

    return createResponse({ code: ApiResponseCode.Success }, movie[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch movie" },
      null,
    );
  }
});

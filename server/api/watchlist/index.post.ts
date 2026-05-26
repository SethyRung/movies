import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { CreateWatchlistBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
        null,
      );
    }

    const body = await readBody<CreateWatchlistBody>(event);

    if (!body.contentType || !body.contentId) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "contentType and contentId are required",
        },
        null,
      );
    }

    if (body.contentType !== "movie" && body.contentType !== "series") {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "contentType must be 'movie' or 'series'",
        },
        null,
      );
    }

    if (body.contentType === "movie") {
      const movie = await db
        .select()
        .from(schema.movies)
        .where(eq(schema.movies.id, body.contentId))
        .limit(1);
      if (!movie.length) {
        return createResponse({ code: ApiResponseCode.NotFound, message: "Movie not found" }, null);
      }
    } else {
      const series = await db
        .select()
        .from(schema.tvSeries)
        .where(eq(schema.tvSeries.id, body.contentId))
        .limit(1);
      if (!series.length) {
        return createResponse(
          { code: ApiResponseCode.NotFound, message: "Series not found" },
          null,
        );
      }
    }

    const existing = await db
      .select()
      .from(schema.watchlist)
      .where(
        and(
          eq(schema.watchlist.userId, userId),
          eq(schema.watchlist.contentType, body.contentType),
          eq(schema.watchlist.contentId, body.contentId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Already in watchlist" },
        null,
      );
    }

    const newItem = await db
      .insert(schema.watchlist)
      .values({
        userId,
        contentType: body.contentType,
        contentId: body.contentId,
      })
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, newItem[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to add to watchlist" },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { CreateMovieViewBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse({ code: ApiResponseCode.Unauthorized, message: "Unauthorized" }, null);
    }

    const body = await readBody<CreateMovieViewBody>(event);

    if (!body.movieId) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "movieId is required",
        },
        null,
      );
    }

    const movieExists = await db
      .select()
      .from(schema.movies)
      .where(eq(schema.movies.id, body.movieId))
      .limit(1);

    if (!movieExists || movieExists.length === 0) {
      return createResponse(
        {
          code: ApiResponseCode.NotFound,
          message: "Movie not found",
        },
        null,
      );
    }

    const existing = await db
      .select()
      .from(schema.movieViews)
      .where(and(eq(schema.movieViews.userId, userId), eq(schema.movieViews.movieId, body.movieId)))
      .limit(1);

    if (existing && existing.length > 0) {
      const updateData: any = {};

      if (body.progressSeconds !== undefined) updateData.progressSeconds = body.progressSeconds;
      if (body.completed !== undefined) updateData.completed = body.completed;

      if (Object.keys(updateData).length > 0) {
        const updated = await db
          .update(schema.movieViews)
          .set(updateData)
          .where(eq(schema.movieViews.id, existing[0]!.id))
          .returning();

        return createResponse({ code: ApiResponseCode.Success }, updated[0]);
      }

      return createResponse({ code: ApiResponseCode.Success }, existing[0]);
    }

    const newMovieView = await db
      .insert(schema.movieViews)
      .values({
        movieId: body.movieId,
        userId,
        progressSeconds: body.progressSeconds,
        completed: body.completed ?? false,
      })
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, newMovieView[0]);
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to create movie view",
      },
      null,
    );
  }
});

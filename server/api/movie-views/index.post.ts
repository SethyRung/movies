import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import type { CreateMovieViewBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateMovieViewBody>(event);

    if (!body.movieId) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
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
          code: ResponseCode.NotFound,
          message: "Movie not found",
        },
        null,
      );
    }

    const newMovieView = await db
      .insert(schema.movieViews)
      .values({
        movieId: body.movieId,
        progressSeconds: body.progressSeconds,
        completed: body.completed ?? false,
      })
      .returning();

    return createResponse({ code: ResponseCode.Success }, newMovieView[0]);
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to create movie view",
      },
      null,
    );
  }
});

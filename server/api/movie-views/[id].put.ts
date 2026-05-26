import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { UpdateMovieViewBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse({ code: ApiResponseCode.Unauthorized, message: "Unauthorized" }, null);
    }

    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        {
          code: ApiResponseCode.InvalidRequest,
          message: "Movie view ID is required",
        },
        null,
      );
    }

    const body = await readBody<UpdateMovieViewBody>(event);

    const existing = await db
      .select()
      .from(schema.movieViews)
      .where(and(eq(schema.movieViews.id, id), eq(schema.movieViews.userId, userId)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Movie view not found" },
        null,
      );
    }

    const updateData: any = {};

    if (body.progressSeconds !== undefined) updateData.progressSeconds = body.progressSeconds;
    if (body.completed !== undefined) updateData.completed = body.completed;

    if (Object.keys(updateData).length === 0) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "No fields to update",
        },
        null,
      );
    }

    const updated = await db
      .update(schema.movieViews)
      .set(updateData)
      .where(eq(schema.movieViews.id, id))
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to update movie view",
      },
      null,
    );
  }
});

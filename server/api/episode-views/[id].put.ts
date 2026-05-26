import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { UpdateEpisodeViewBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not found in context" },
        null,
      );
    }

    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        {
          code: ApiResponseCode.InvalidRequest,
          message: "Episode view ID is required",
        },
        null,
      );
    }

    const body = await readBody<UpdateEpisodeViewBody>(event);

    const existing = await db
      .select()
      .from(schema.episodeViews)
      .where(and(eq(schema.episodeViews.id, id), eq(schema.episodeViews.userId, userId)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse(
        { code: ApiResponseCode.NotFound, message: "Episode view not found" },
        null,
      );
    }

    const updateData: any = {};

    if (body.sessionId !== undefined) updateData.sessionId = body.sessionId;
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
      .update(schema.episodeViews)
      .set(updateData)
      .where(eq(schema.episodeViews.id, id))
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to update episode view",
      },
      null,
    );
  }
});

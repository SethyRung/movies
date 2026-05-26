import { db, schema } from "@nuxthub/db";
import { eq, and } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { CreateEpisodeViewBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "User not found in context" },
        null,
      );
    }

    const body = await readBody<CreateEpisodeViewBody>(event);

    if (!body.episodeId) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "episodeId is required",
        },
        null,
      );
    }

    const episodeExists = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.id, body.episodeId))
      .limit(1);

    if (!episodeExists || episodeExists.length === 0) {
      return createResponse(
        {
          code: ApiResponseCode.NotFound,
          message: "Episode not found",
        },
        null,
      );
    }

    const existing = await db
      .select()
      .from(schema.episodeViews)
      .where(
        and(
          eq(schema.episodeViews.userId, userId),
          eq(schema.episodeViews.episodeId, body.episodeId),
        ),
      )
      .limit(1);

    if (existing && existing.length > 0) {
      const updateData: any = {};

      if (body.sessionId !== undefined) updateData.sessionId = body.sessionId;
      if (body.progressSeconds !== undefined) updateData.progressSeconds = body.progressSeconds;
      if (body.completed !== undefined) updateData.completed = body.completed;
      updateData.viewedAt = new Date();

      const updated = await db
        .update(schema.episodeViews)
        .set(updateData)
        .where(eq(schema.episodeViews.id, existing[0]!.id))
        .returning();

      return createResponse({ code: ApiResponseCode.Success }, updated[0]);
    }

    const newEpisodeView = await db
      .insert(schema.episodeViews)
      .values({
        episodeId: body.episodeId,
        userId,
        sessionId: body.sessionId,
        progressSeconds: body.progressSeconds,
        completed: body.completed ?? false,
      })
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, newEpisodeView[0]);
  } catch {
    return createResponse(
      {
        code: ApiResponseCode.InternalError,
        message: "Failed to create episode view",
      },
      null,
    );
  }
});

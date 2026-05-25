import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { CreateEpisodeViewBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
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

    const newEpisodeView = await db
      .insert(schema.episodeViews)
      .values({
        episodeId: body.episodeId,
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

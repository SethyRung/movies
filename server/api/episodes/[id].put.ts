import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode, VALID_EMBED_TYPES } from "#shared/types";
import type { UpdateEpisodeBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        {
          code: ApiResponseCode.InvalidRequest,
          message: "Episode ID is required",
        },
        null,
      );
    }

    const body = await readBody<UpdateEpisodeBody>(event);

    const existing = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Episode not found" }, null);
    }

    if (body.embedType) {
      const validEmbedTypes = VALID_EMBED_TYPES as readonly string[];
      if (!validEmbedTypes.includes(body.embedType)) {
        return createResponse(
          {
            code: ApiResponseCode.ValidationError,
            message: `embedType must be one of: ${validEmbedTypes.join(", ")}`,
          },
          null,
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.episodeNumber !== undefined) updateData.episodeNumber = body.episodeNumber;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.embedUrl !== undefined) updateData.embedUrl = body.embedUrl;
    if (body.embedType !== undefined) updateData.embedType = body.embedType;

    const updated = await db
      .update(schema.episodes)
      .set(updateData)
      .where(eq(schema.episodes.id, id))
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to update episode" },
      null,
    );
  }
});

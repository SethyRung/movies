import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import type { UpdateEpisodeBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        {
          code: ResponseCode.InvalidRequest,
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
      return createResponse({ code: ResponseCode.NotFound, message: "Episode not found" }, null);
    }

    if (body.embedType) {
      const validEmbedTypes = ["youtube", "vimeo", "dailymotion", "custom"];
      if (!validEmbedTypes.includes(body.embedType)) {
        return createResponse(
          {
            code: ResponseCode.ValidationError,
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

    return createResponse({ code: ResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to update episode" },
      null,
    );
  }
});

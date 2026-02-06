import { db, schema } from "@nuxthub/db";
import { eq, sql } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import type { CreateEpisodeBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const seasonId = getRouterParam(event, "seasonId");

    if (!seasonId) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Season ID is required" },
        null,
      );
    }

    const body = await readBody<CreateEpisodeBody>(event);

    if (!body.episodeNumber || !body.embedUrl || !body.embedType) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "episodeNumber, embedUrl, and embedType are required",
        },
        null,
      );
    }

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

    // Check if season exists
    const season = await db
      .select()
      .from(schema.seasons)
      .where(eq(schema.seasons.id, seasonId))
      .limit(1);

    if (!season || season.length === 0) {
      return createResponse({ code: ResponseCode.NotFound, message: "Season not found" }, null);
    }

    // Check if episode with same number already exists in this season
    const existingEpisodes = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.seasonId, seasonId))
      .orderBy(schema.episodes.episodeNumber);

    const episodeExists = existingEpisodes.some((e) => e.episodeNumber === body.episodeNumber);

    if (episodeExists) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: `Episode ${body.episodeNumber} already exists in this season`,
        },
        null,
      );
    }

    const newEpisode = await db
      .insert(schema.episodes)
      .values({
        seasonId,
        episodeNumber: body.episodeNumber,
        duration: body.duration,
        embedUrl: body.embedUrl,
        embedType: body.embedType,
        status: "active",
      })
      .returning();

    // Update episode count in season
    await db
      .update(schema.seasons)
      .set({ episodeCount: existingEpisodes.length + 1, updatedAt: new Date() })
      .where(eq(schema.seasons.id, seasonId));

    return createResponse({ code: ResponseCode.Success }, newEpisode[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to create episode" },
      null,
    );
  }
});

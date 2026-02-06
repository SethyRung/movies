import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const seasonId = getRouterParam(event, "seasonId");

    if (!seasonId) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Season ID is required" },
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

    const episodes = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.seasonId, seasonId))
      .orderBy(schema.episodes.episodeNumber);

    return createResponse({ code: ResponseCode.Success }, episodes);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch episodes" },
      null,
    );
  }
});

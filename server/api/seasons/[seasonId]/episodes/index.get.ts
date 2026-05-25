import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const seasonId = getRouterParam(event, "seasonId");

    if (!seasonId) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Season ID is required" },
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
      return createResponse({ code: ApiResponseCode.NotFound, message: "Season not found" }, null);
    }

    const episodes = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.seasonId, seasonId))
      .orderBy(schema.episodes.episodeNumber);

    return createResponse({ code: ApiResponseCode.Success }, episodes);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch episodes" },
      null,
    );
  }
});

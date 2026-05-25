import { db, schema } from "@nuxthub/db";
import { eq, sql } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

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

    const existing = await db
      .select()
      .from(schema.episodes)
      .where(eq(schema.episodes.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Episode not found" }, null);
    }

    const seasonId = existing[0]!.seasonId;

    await db.delete(schema.episodes).where(eq(schema.episodes.id, id));

    // Update episode count in season
    const episodesCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.episodes)
      .where(eq(schema.episodes.seasonId, seasonId));

    const newCount = episodesCount[0]?.count || 0;

    await db
      .update(schema.seasons)
      .set({ episodeCount: newCount, updatedAt: new Date() })
      .where(eq(schema.seasons.id, seasonId));

    return createResponse({ code: ApiResponseCode.Success }, { id });
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to delete episode" },
      null,
    );
  }
});

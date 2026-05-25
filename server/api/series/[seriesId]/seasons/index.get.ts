import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const seriesId = getRouterParam(event, "seriesId");

    if (!seriesId) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Series ID is required" },
        null,
      );
    }

    // Check if series exists
    const series = await db
      .select()
      .from(schema.tvSeries)
      .where(eq(schema.tvSeries.id, seriesId))
      .limit(1);

    if (!series || series.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Series not found" }, null);
    }

    const seasons = await db
      .select()
      .from(schema.seasons)
      .where(eq(schema.seasons.seriesId, seriesId))
      .orderBy(schema.seasons.seasonNumber);

    return createResponse({ code: ApiResponseCode.Success }, seasons);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch seasons" },
      null,
    );
  }
});

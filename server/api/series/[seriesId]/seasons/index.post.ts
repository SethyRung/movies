import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import type { CreateSeasonBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const seriesId = getRouterParam(event, "seriesId");

    if (!seriesId) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Series ID is required" },
        null,
      );
    }

    const body = await readBody<CreateSeasonBody>(event);

    if (!body.seasonNumber) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "seasonNumber is required",
        },
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
      return createResponse({ code: ResponseCode.NotFound, message: "Series not found" }, null);
    }

    // Check if season with same number already exists
    const existingSeason = await db
      .select()
      .from(schema.seasons)
      .where(eq(schema.seasons.seriesId, seriesId))
      .orderBy(schema.seasons.seasonNumber);

    const seasonExists = existingSeason.some((s) => s.seasonNumber === body.seasonNumber);

    if (seasonExists) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: `Season ${body.seasonNumber} already exists for this series`,
        },
        null,
      );
    }

    const newSeason = await db
      .insert(schema.seasons)
      .values({
        seriesId,
        seasonNumber: body.seasonNumber,
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        releaseYear: body.releaseYear,
        episodeCount: 0,
      })
      .returning();

    return createResponse({ code: ResponseCode.Success }, newSeason[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to create season" },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";
import type { UpdateSeasonBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Season ID is required" },
        null,
      );
    }

    const body = await readBody<UpdateSeasonBody>(event);

    const existing = await db
      .select()
      .from(schema.seasons)
      .where(eq(schema.seasons.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Season not found" }, null);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.seasonNumber !== undefined) updateData.seasonNumber = body.seasonNumber;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.releaseYear !== undefined) updateData.releaseYear = body.releaseYear;

    const updated = await db
      .update(schema.seasons)
      .set(updateData)
      .where(eq(schema.seasons.id, id))
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to update season" },
      null,
    );
  }
});

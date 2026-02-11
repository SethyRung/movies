import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import type { UpdateSeriesBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Series ID is required" },
        null,
      );
    }

    const body = await readBody<UpdateSeriesBody>(event);

    const existing = await db
      .select()
      .from(schema.tvSeries)
      .where(eq(schema.tvSeries.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ResponseCode.NotFound, message: "Series not found" }, null);
    }

    if (body.status && !["ongoing", "completed", "draft", "archived"].includes(body.status)) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "status must be one of: ongoing, completed, draft, archived",
        },
        null,
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.poster !== undefined) updateData.poster = body.poster;
    if (body.firstAiredYear !== undefined) updateData.firstAiredYear = body.firstAiredYear;
    if (body.lastAiredYear !== undefined) updateData.lastAiredYear = body.lastAiredYear;
    if (body.rating !== undefined) updateData.rating = String(body.rating);
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await db
      .update(schema.tvSeries)
      .set(updateData)
      .where(eq(schema.tvSeries.id, id))
      .returning();

    return createResponse({ code: ResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to update series" },
      null,
    );
  }
});

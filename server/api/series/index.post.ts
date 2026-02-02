import { db, schema } from "@nuxthub/db";
import { ResponseCode } from "#shared/types";
import type { CreateSeriesBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateSeriesBody>(event);

    if (!body.title) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "title is required",
        },
        null,
      );
    }

    if (
      body.status &&
      !["ongoing", "completed", "draft", "archived"].includes(body.status)
    ) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "status must be one of: ongoing, completed, draft, archived",
        },
        null,
      );
    }

    const newSeries = await db
      .insert(schema.tvSeries)
      .values({
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        poster: body.poster,
        firstAiredYear: body.firstAiredYear,
        lastAiredYear: body.lastAiredYear,
        rating: body.rating ? String(body.rating) : null,
        featured: body.featured || false,
        status: (body.status as any) || "ongoing",
        createdBy: body.createdBy,
      })
      .returning();

    return createResponse({ code: ResponseCode.Success }, newSeries[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to create series" },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode, VALID_EMBED_TYPES } from "#shared/types";
import type { UpdateMovieBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Movie ID is required" },
        null,
      );
    }

    const body = await readBody<UpdateMovieBody>(event);

    const existing = await db.select().from(schema.movies).where(eq(schema.movies.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Movie not found" }, null);
    }

    if (body.embedType) {
      const validEmbedTypes = VALID_EMBED_TYPES as readonly string[];
      if (!validEmbedTypes.includes(body.embedType)) {
        return createResponse(
          {
            code: ApiResponseCode.ValidationError,
            message: `embedType must be one of: ${validEmbedTypes.join(", ")}`,
          },
          null,
        );
      }
    }

    if (body.status && !["active", "draft", "archived"].includes(body.status)) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "status must be one of: active, draft, archived",
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
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.embedUrl !== undefined) updateData.embedUrl = body.embedUrl;
    if (body.embedType !== undefined) updateData.embedType = body.embedType;
    if (body.releaseYear !== undefined) updateData.releaseYear = body.releaseYear;
    if (body.rating !== undefined) updateData.rating = String(body.rating);
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await db
      .update(schema.movies)
      .set(updateData)
      .where(eq(schema.movies.id, id))
      .returning();

    return createResponse({ code: ApiResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to update movie" },
      null,
    );
  }
});

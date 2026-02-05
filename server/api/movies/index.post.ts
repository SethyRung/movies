import { db, schema } from "@nuxthub/db";
import { ResponseCode } from "#shared/types";
import type { CreateMovieBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateMovieBody>(event);

    if (!body.title || !body.embedUrl || !body.embedType) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "title, embedUrl, and embedType are required",
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

    if (body.status && !["active", "draft", "archived"].includes(body.status)) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "status must be one of: active, draft, archived",
        },
        null,
      );
    }

    const newMovie = await db
      .insert(schema.movies)
      .values({
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        poster: body.poster,
        duration: body.duration,
        embedUrl: body.embedUrl,
        embedType: body.embedType,
        releaseYear: body.releaseYear,
        rating: body.rating ? String(body.rating) : null,
        featured: body.featured || false,
        status: (body.status as any) || "active",
        createdBy: body.createdBy,
      })
      .returning();

    return createResponse({ code: ResponseCode.Success }, newMovie[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to create movie" },
      null,
    );
  }
});

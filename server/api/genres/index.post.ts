import { db, schema } from "@nuxthub/db";
import { ResponseCode } from "#shared/types";
import type { CreateGenreBody } from "#server/types";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateGenreBody>(event);

    if (!body.name || !body.slug) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "name and slug are required",
        },
        null,
      );
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(body.slug)) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "slug must contain only lowercase letters, numbers, and hyphens",
        },
        null,
      );
    }

    const existingGenre = await db
      .select()
      .from(schema.genres)
      .where(eq(schema.genres.slug, body.slug))
      .limit(1);

    if (existingGenre && existingGenre.length > 0) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "Genre with this slug already exists",
        },
        null,
      );
    }

    const newGenre = await db
      .insert(schema.genres)
      .values({
        name: body.name,
        slug: body.slug,
      })
      .returning();

    return createResponse({ code: ResponseCode.Success }, newGenre[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to create genre" },
      null,
    );
  }
});

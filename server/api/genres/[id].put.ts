import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import type { UpdateGenreBody } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Genre ID is required" },
        null,
      );
    }

    const body = await readBody<UpdateGenreBody>(event);

    const existing = await db.select().from(schema.genres).where(eq(schema.genres.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return createResponse({ code: ResponseCode.NotFound, message: "Genre not found" }, null);
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) {
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

      const slugExists = await db
        .select()
        .from(schema.genres)
        .where(eq(schema.genres.slug, body.slug))
        .limit(1);

      if (slugExists && slugExists.length > 0 && slugExists[0]?.id !== id) {
        return createResponse(
          {
            code: ResponseCode.ValidationError,
            message: "Genre with this slug already exists",
          },
          null,
        );
      }

      updateData.slug = body.slug;
    }

    if (Object.keys(updateData).length === 0) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "No fields to update",
        },
        null,
      );
    }

    const updated = await db
      .update(schema.genres)
      .set(updateData)
      .where(eq(schema.genres.id, id))
      .returning();

    return createResponse({ code: ResponseCode.Success }, updated[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to update genre" },
      null,
    );
  }
});

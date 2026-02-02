import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ResponseCode.InvalidRequest, message: "Series ID is required" },
        null,
      );
    }

    const series = await db
      .select()
      .from(schema.tvSeries)
      .where(eq(schema.tvSeries.id, id))
      .limit(1);

    if (!series || series.length === 0) {
      return createResponse(
        { code: ResponseCode.NotFound, message: "Series not found" },
        null,
      );
    }

    return createResponse({ code: ResponseCode.Success }, series[0]);
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch series" },
      null,
    );
  }
});

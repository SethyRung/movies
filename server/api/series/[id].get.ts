import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ApiResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      return createResponse(
        { code: ApiResponseCode.InvalidRequest, message: "Series ID is required" },
        null,
      );
    }

    const series = await db
      .select()
      .from(schema.tvSeries)
      .where(eq(schema.tvSeries.id, id))
      .limit(1);

    if (!series || series.length === 0) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "Series not found" }, null);
    }

    return createResponse({ code: ApiResponseCode.Success }, series[0]);
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch series" },
      null,
    );
  }
});

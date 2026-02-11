import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ refreshToken: string }>(event);

    if (!body.refreshToken) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "Refresh token is required",
        },
        null,
      );
    }

    // Revoke the refresh token
    const result = await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.token, body.refreshToken))
      .returning();

    if (result.length === 0) {
      return createResponse(
        {
          code: ResponseCode.NotFound,
          message: "Refresh token not found",
        },
        null,
      );
    }

    return createResponse(
      {
        code: ResponseCode.Success,
        message: "Logged out successfully",
      },
      null,
    );
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to logout",
      },
      null,
    );
  }
});

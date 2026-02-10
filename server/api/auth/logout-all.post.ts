import { db, schema } from "@nuxthub/db";
import { eq, and, isNull } from "drizzle-orm";
import { ResponseCode } from "#shared/types";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.userId;

    if (!userId) {
      return createResponse(
        { code: ResponseCode.Unauthorized, message: "User not found in context" },
        null,
      );
    }

    // Revoke all refresh tokens for this user
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.refreshTokens.userId, userId), isNull(schema.refreshTokens.revokedAt)));

    return createResponse(
      {
        code: ResponseCode.Success,
        message: "Logged out from all devices successfully",
      },
      null,
    );
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to logout from all devices",
      },
      null,
    );
  }
});

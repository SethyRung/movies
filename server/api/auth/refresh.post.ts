import { db, schema } from "@nuxthub/db";
import { eq, and, gt, isNull } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import {
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
  calculateRefreshTokenExpiry,
} from "#server/utils/auth";

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

    const config = useRuntimeConfig();

    const payload = verifyRefreshToken(body.refreshToken, config.jwt.refresh);

    if (!payload) {
      return createResponse(
        {
          code: ResponseCode.Unauthorized,
          message: "Invalid or expired refresh token",
        },
        null,
      );
    }

    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(schema.refreshTokens.token, body.refreshToken),
        eq(schema.refreshTokens.userId, payload.userId),
        gt(schema.refreshTokens.expiresAt, new Date()),
        isNull(schema.refreshTokens.revokedAt),
      ),
    });

    if (!storedToken) {
      return createResponse(
        {
          code: ResponseCode.Unauthorized,
          message: "Invalid or expired refresh token",
        },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, payload.userId),
    });

    if (!user) {
      return createResponse(
        {
          code: ResponseCode.NotFound,
          message: "User not found",
        },
        null,
      );
    }

    const accessToken = generateToken(user, config.jwt.access);
    const newRefreshToken = generateRefreshToken(user.id, config.jwt.refresh);
    const refreshTokenExpiry = calculateRefreshTokenExpiry(config.jwt.refresh.expiresIn);

    // Revoke old refresh token and create new one
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.id, storedToken.id));

    await db.insert(schema.refreshTokens).values({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    return createResponse(
      {
        code: ResponseCode.Success,
        message: "Token refreshed successfully",
      },
      {
        accessToken,
        refreshToken: newRefreshToken,
      },
    );
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to refresh token",
      },
      null,
    );
  }
});

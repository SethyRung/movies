import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { ResponseCode } from "#shared/types";
import { verifyPassword, generateToken } from "#server/utils/auth";
import { LoginRequest } from "#server/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginRequest>(event);

    if (!body.email || !body.password) {
      return createResponse(
        {
          code: ResponseCode.ValidationError,
          message: "Email and password are required",
        },
        null,
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, body.email),
    });

    if (!user) {
      return createResponse(
        {
          code: ResponseCode.Unauthorized,
          message: "Invalid email or password",
        },
        null,
      );
    }

    const isValidPassword = await verifyPassword(body.password, user.passwordHash);

    if (!isValidPassword) {
      return createResponse(
        {
          code: ResponseCode.Unauthorized,
          message: "Invalid email or password",
        },
        null,
      );
    }

    const config = useRuntimeConfig();
    const accessToken = generateToken(user, config.jwt.access);

    return createResponse(
      {
        code: ResponseCode.Success,
        message: "Login successful",
      },
      {
        accessToken,
      },
    );
  } catch {
    return createResponse(
      {
        code: ResponseCode.InternalError,
        message: "Failed to login",
      },
      null,
    );
  }
});

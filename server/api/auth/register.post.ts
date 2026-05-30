import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string; password: string; name: string }>(event);

    if (!body?.email || !body?.password || !body?.name) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Email, password, and name are required",
        },
        null,
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, body.email),
    });

    if (existingUser) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Email already registered" },
        null,
      );
    }

    const passwordHash = await hashPassword(body.password);

    const newUser = await db
      .insert(schema.users)
      .values({
        email: body.email,
        passwordHash,
        name: body.name,
      })
      .returning();

    if (!newUser || newUser.length === 0) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create user" },
        null,
      );
    }

    const config = useRuntimeConfig();
    const user = newUser[0]!;

    const accessToken = generateTokens(
      { userId: user.id, email: user.email, name: user.name },
      config.jwt.access,
    );

    const refreshToken = generateTokens({ userId: user.id, type: "refresh" }, config.jwt.refresh);

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: expiresInToDate(config.jwt.refresh.expiresIn),
    });

    const isProduction = process.env.NODE_ENV === "production";

    setCookie(event, CookieName.AccessToken, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.access.expiresIn),
    });

    setCookie(event, CookieName.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInToSeconds(config.jwt.refresh.expiresIn),
    });

    return createResponse(
      { code: ApiResponseCode.Success, message: "Registration successful" },
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    );
  } catch {
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "An error occurred during registration" },
      null,
    );
  }
});

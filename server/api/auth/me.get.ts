import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
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

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      return createResponse({ code: ResponseCode.NotFound, message: "User not found" }, null);
    }

    return createResponse(
      { code: ResponseCode.Success },
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    );
  } catch {
    return createResponse(
      { code: ResponseCode.InternalError, message: "Failed to fetch user" },
      null,
    );
  }
});

import { db, schema } from "@nuxthub/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export default defineNitroPlugin(async () => {
  try {
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.role, "admin"),
    });

    if (existing) {
      return;
    }

    const config = useRuntimeConfig();

    const { name, email, password } = config.admin;

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(schema.users).values({
      name,
      email,
      passwordHash,
      role: "admin",
    });
  } catch (error) {
    console.error("Failed to ensure admin user:", error);
  }
});

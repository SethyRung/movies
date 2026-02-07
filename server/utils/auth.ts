import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import type { User } from "#shared/types";
import { JWTPayload } from "#server/types";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(
  user: Omit<User, "passwordHash">,
  option: {
    secret: string;
    expiresIn: string;
  },
): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, option.secret, {
    expiresIn: option.expiresIn as SignOptions["expiresIn"],
  });
}

export function verifyToken(
  token: string,
  option: {
    secret: string;
  },
): JWTPayload | null {
  try {
    return jwt.verify(token, option.secret) as JWTPayload;
  } catch {
    return null;
  }
}

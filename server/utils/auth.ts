import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import type { User } from "#shared/types";
import { JWTPayload, RefreshTokenPayload } from "#server/types";

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

export function generateRefreshToken(
  userId: string,
  option: {
    secret: string;
    expiresIn: string;
  },
): string {
  const payload: RefreshTokenPayload = {
    userId,
    type: "refresh",
  };

  return jwt.sign(payload, option.secret, {
    expiresIn: option.expiresIn as SignOptions["expiresIn"],
  });
}

export function verifyRefreshToken(
  token: string,
  option: {
    secret: string;
  },
): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, option.secret) as RefreshTokenPayload;
    if (payload.type !== "refresh") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

const DEFAULT_REFRESH_TOKEN_EXPIRY_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateRefreshTokenExpiry(expiresIn: string): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(now.getTime() + DEFAULT_REFRESH_TOKEN_EXPIRY_DAYS * MILLISECONDS_PER_DAY);
  }

  const value = parseInt(match[1] ?? "", 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      now.setDate(now.getDate() + value);
      break;
    case "h":
      now.setHours(now.getHours() + value);
      break;
    case "m":
      now.setMinutes(now.getMinutes() + value);
      break;
    case "s":
      now.setSeconds(now.getSeconds() + value);
      break;
  }

  return now;
}

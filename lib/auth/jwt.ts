import { SignJWT, jwtVerify } from "jose";

const requiredEnv = ["AUTH_SECRET"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const secret = new TextEncoder().encode(process.env.AUTH_SECRET as string);

export type AuthTokenPayload = {
  userId: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

export async function signAuthToken(payload: AuthTokenPayload, maxAgeSeconds: number) {
  const jwt = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secret);
  return jwt;
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload as unknown as AuthTokenPayload & { exp: number; iat: number };
}



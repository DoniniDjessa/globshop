import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const res = NextResponse.json({ success: true });
  const cookieStore = await cookies();
  cookieStore.set("auth", "", { path: "/", maxAge: 0 });
  return res;
}



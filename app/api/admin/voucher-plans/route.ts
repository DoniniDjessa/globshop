import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("dd_voucher_plans").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ plans: data });
}

export async function POST(request: Request) {
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload || (payload as any).role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({} as any));
  const { name, description, max_businesses } = body || {};
  if (!name || !max_businesses) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("dd_voucher_plans")
    .insert({ name, description, max_businesses })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ plan: data });
}



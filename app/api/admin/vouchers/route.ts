import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { getServerSupabase } from "@/lib/supabase/server";

function generateCode(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("dd_vouchers")
    .select("id, code, plan_id, max_businesses, is_suspended, used_by_user_id, used_at, status, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ vouchers: data });
}

export async function POST(request: Request) {
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload || (payload as any).role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({} as any));
  const { plan_id } = body || {};
  if (!plan_id) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const supabase = getServerSupabase();
  const { data: plan } = await supabase
    .from("dd_voucher_plans")
    .select("id, max_businesses")
    .eq("id", plan_id)
    .maybeSingle();
  if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

  const code = generateCode();
  const { data, error } = await supabase
    .from("dd_vouchers")
    .insert({ code, plan_id, max_businesses: plan.max_businesses })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ voucher: data });
}

export async function PATCH(request: Request) {
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload || (payload as any).role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({} as any));
  const { voucher_id, is_suspended } = body || {};
  if (!voucher_id || typeof is_suspended !== "boolean") return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("dd_vouchers")
    .update({ is_suspended })
    .eq("id", voucher_id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ voucher: data });
}

export async function DELETE(request: Request) {
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload || (payload as any).role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({} as any));
  const { voucher_id } = body || {};
  if (!voucher_id) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const supabase = getServerSupabase();
  const { error } = await supabase.from("dd_vouchers").delete().eq("id", voucher_id);
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ success: true });
}



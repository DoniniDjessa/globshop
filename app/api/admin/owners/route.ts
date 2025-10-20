import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { getServerSupabase } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone/normalize";

export async function GET() {
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload || (payload as any).role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  // Fetch owners and their businesses (if any)
  const { data, error } = await supabase
    .from("dd_users")
    .select("id, full_name, email, phone, role, is_active, dd_businesses(name)")
    .eq("role", "owner")
    .order("full_name", { ascending: true });
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });

  // Normalize shape: flatten dd_businesses to names array
  const owners = (data || []).map((u: any) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    is_active: u.is_active,
    businesses: (u.dd_businesses || []).map((b: any) => b.name),
  }));

  return NextResponse.json({ owners });
}

export async function POST(request: Request) {
  const token = (await cookies()).get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload || (payload as any).role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({} as any));
  const full_name = String(body.full_name || "").trim();
  const email = body.email ? String(body.email).trim() : null;
  const phone = body.phone ? normalizePhone(String(body.phone)) : null;
  if (!full_name || (!email && !phone)) return NextResponse.json({ error: "Nom et e‑mail ou téléphone requis" }, { status: 400 });

  const defaultPassword = "00000000";
  const authEmail = email || `${(phone || "user").replace(/\D+/g, "")}@alias.local`;

  const supabase = getServerSupabase();
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: authEmail,
    password: defaultPassword,
    email_confirm: true,
    phone: phone || undefined,
    phone_confirm: !!phone,
    user_metadata: { full_name, phone },
  });
  if (createErr || !created?.user) return NextResponse.json({ error: "Création impossible" }, { status: 400 });
  const storedEmail = email ?? authEmail;
  const { error: upsertErr } = await supabase.from("dd_users").upsert({
    id: created.user.id,
    email: storedEmail,
    phone,
    full_name,
    role: "owner",
    is_active: true,
  }, { onConflict: "id" });
  if (upsertErr) return NextResponse.json({ error: "Profil non créé" }, { status: 500 });

  return NextResponse.json({ success: true, user_id: created.user.id, default_password: defaultPassword });
}



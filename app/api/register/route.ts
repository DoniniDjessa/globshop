import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { getServerSupabase } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone/normalize";
import { signAuthToken } from "@/lib/auth/jwt";

type RegisterBody = {
  full_name: string;
  email: string | null;
  phone?: string | null;
  password: string;
  voucher_code: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const supabase = getServerSupabase();

  // Validate voucher
  const { data: voucher } = await supabase
    .from("dd_vouchers")
    .select("id, max_businesses, is_suspended, used_at")
    .eq("code", body.voucher_code)
    .maybeSingle();
  if (!voucher) return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  if (voucher.used_at) return NextResponse.json({ error: "Code déjà utilisé" }, { status: 400 });
  if ((voucher as any).is_suspended) return NextResponse.json({ error: "Code suspendu" }, { status: 400 });

  // Create auth user
  const anon = getAnonSupabase();
  const phone = body.phone ? normalizePhone(body.phone) : null;
  if (!body.email && !phone) {
    return NextResponse.json({ error: "E‑mail ou téléphone requis" }, { status: 400 });
  }
  let signUp: any;
  let signUpErr: any;
  if (body.email) {
    ({ data: signUp, error: signUpErr } = await anon.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { full_name: body.full_name, phone } },
    }));
  } else {
    // Supabase email+password required for signUp; if only phone is provided, we can synthesize an email alias
    const aliasEmail = `${phone?.replace(/\D+/g, "") || "user"}@alias.local`;
    ({ data: signUp, error: signUpErr } = await anon.auth.signUp({
      email: aliasEmail,
      password: body.password,
      options: { data: { full_name: body.full_name, phone } },
    }));
  }
  if (signUpErr || !signUp.user) return NextResponse.json({ error: "Inscription impossible" }, { status: 400 });

  const user = signUp.user;
  if (!user) {
    return NextResponse.json({ error: "Inscription impossible" }, { status: 400 });
  }
  // Upsert profile as owner
  const { error: upsertErr } = await supabase.from("dd_users").upsert({
    id: user.id,
    email: body.email,
    phone,
    full_name: body.full_name,
    role: "owner",
    is_active: true,
  }, { onConflict: "id" });
  if (upsertErr) {
    return NextResponse.json({ error: "Profil non créé" }, { status: 500 });
  }

  // Business creation deferred

  // Mark voucher used
  const { error: useErr } = await supabase
    .from("dd_vouchers")
    .update({ used_by_user_id: user.id, used_at: new Date().toISOString() })
    .eq("code", body.voucher_code)
    .is("used_at", null);
  if (useErr) return NextResponse.json({ error: "Utilisation du code échouée" }, { status: 400 });

  // Sign in owner (session cookie with our JWT)
  const token = await signAuthToken({ userId: user.id, email: body.email, phone, role: "owner" }, 60 * 60 * 24 * 7);
  const res = NextResponse.json({ success: true });
  (await cookies()).set("auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}



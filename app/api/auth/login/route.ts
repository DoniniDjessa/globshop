import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { getServerSupabase } from "@/lib/supabase/server";
import { signAuthToken } from "@/lib/auth/jwt";
import { normalizePhone } from "@/lib/phone/normalize";

type LoginBody = {
  identifier: string; // email or phone
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const identifier = (body.identifier || "").trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const supabase = getAnonSupabase();
    // Determine if identifier is email or phone; Supabase Auth supports email+password.
    // If phone is provided, we assume it maps to a user with that phone; however, standard signInWithPassword uses email.
    // Strategy: try email sign-in; if identifier looks like phone, we fetch email by phone then sign in.
    const looksLikeEmail = /@/.test(identifier);

    let emailForAuth: string | null = looksLikeEmail ? identifier : null;

    if (!looksLikeEmail) {
      const normalized = normalizePhone(identifier);
      const { data: profileByPhone, error: phoneErr } = await supabase
        .from("dd_users")
        .select("email")
        .eq("phone", normalized)
        .maybeSingle();
      if (phoneErr) {
        return NextResponse.json({ error: "Auth error" }, { status: 500 });
      }
      emailForAuth = profileByPhone?.email ?? null;
      if (!emailForAuth) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailForAuth!,
      password,
    });
    if (signInError || !signInData.session || !signInData.user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Ensure dd_users row exists/upsert basic info
    const { user } = signInData;
    const normalizedPhone = (user.user_metadata as any)?.phone
      ? normalizePhone((user.user_metadata as any).phone as string)
      : null;

    await supabase.from("dd_users").upsert(
      {
        id: user.id,
        email: user.email,
        phone: normalizedPhone,
        full_name: (user.user_metadata as any)?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        is_active: true,
      },
      { onConflict: "id" }
    );

    // Fetch role using service role to avoid any RLS issues
    const service = getServerSupabase();
    const { data: profile, error: roleErr } = await service
      .from("dd_users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (roleErr) {
      return NextResponse.json({ error: "Auth error" }, { status: 500 });
    }

    const token = await signAuthToken(
      { userId: user.id, email: user.email, phone: normalizedPhone, role: profile?.role ?? null },
      60 * 60 * 24 * 7 // 7 days
    );

    const res = NextResponse.json({ success: true, role: profile?.role ?? null });
    const cookieStore = await cookies();
    cookieStore.set("auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



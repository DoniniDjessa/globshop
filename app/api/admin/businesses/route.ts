import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("dd_businesses")
    .select("id, name, type, owner_id, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ businesses: data });
}



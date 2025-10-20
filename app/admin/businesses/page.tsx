import { headers } from "next/headers";

async function getBusinesses() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/admin/businesses`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") || "" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.businesses as Array<{ id: string; name: string; type: string; owner_id: string; created_at: string }>;
}

export default async function AdminBusinessesPage() {
  const businesses = await getBusinesses();
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-fira-condensed)" }}>Business</h2>
      <div className="grid gap-2">
        {businesses.map((b) => (
          <div key={b.id} className="rounded-md border border-black/10 dark:border-white/10 p-3">
            <div className="font-medium">{b.name}</div>
            <div className="text-xs text-zinc-600">{b.type}</div>
          </div>
        ))}
        {businesses.length === 0 ? <div className="text-sm text-zinc-500">Aucun business pour le moment.</div> : null}
      </div>
    </div>
  );
}



import { headers } from "next/headers";
import CreatePlanForm from "@/components/admin/create-plan-form";

async function getPlans() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/admin/voucher-plans`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") || "" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.plans as Array<{ id: string; name: string; description: string | null; max_businesses: number }>;
}

export default async function PlansPage() {
  const plans = await getPlans();
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-fira-condensed)" }}>Plans</h2>
      <CreatePlanForm />
      <div className="grid gap-4 mt-4">
        {plans.map((p, idx) => (
          <div key={p.id || `${p.name}-${idx}`} className="rounded-md border border-black/10 dark:border-white/10 p-4">
            <div className="font-medium">{p.name} <span className="text-xs text-zinc-500">({p.max_businesses} business)</span></div>
            {p.description ? <div className="text-sm text-zinc-500">{p.description}</div> : null}
          </div>
        ))}
        {plans.length === 0 ? <div className="text-sm text-zinc-500">Aucun plan pour le moment.</div> : null}
      </div>
    </div>
  );
}




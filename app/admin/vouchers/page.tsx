import { headers } from "next/headers";

async function getVouchers() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/admin/vouchers`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") || "" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.vouchers as Array<{ id: string; code: string; status: string; created_at: string; used_at: string | null; is_suspended: boolean }>;
}

async function getPlans() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/admin/voucher-plans`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") || "" },
  });
  if (!res.ok) return [] as Array<{ id: string; name: string; max_businesses: number }>;
  const data = await res.json();
  return data.plans as Array<{ id: string; name: string; max_businesses: number }>;
}

export default async function VouchersPage() {
  const [vouchers, plans] = await Promise.all([getVouchers(), getPlans()]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-fira-condensed)" }}>Vouchers</h2>
      <GenerateVoucherForm plans={plans} />
      <div className="grid gap-2">
        {vouchers.map((v, idx) => (
          <VoucherRow key={v.id || `${v.code}-${idx}`} v={v} />
        ))}
        {vouchers.length === 0 ? <div className="text-sm text-zinc-500">Aucun voucher pour le moment.</div> : null}
      </div>
    </div>
  );
}

function VoucherRow({ v }: { v: { id: string; code: string; status: string; created_at: string; used_at: string | null; is_suspended: boolean } }) {
  async function action(formData: FormData) {
    "use server";
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("host") || "localhost:3000";
    const base = `${proto}://${host}`;
    const body = { voucher_id: String(formData.get("voucher_id")), is_suspended: String(formData.get("next")) === "1" };
    await fetch(`${base}/api/admin/vouchers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: h.get("cookie") || "" },
      body: JSON.stringify(body),
    });
  }

  const next = v.is_suspended ? { label: "Reprendre", value: "0" } : { label: "Suspendre", value: "1" };
  return (
    <div className="rounded-md border border-black/10 dark:border-white/10 p-3 flex items-center justify-between gap-3">
      <div className="font-mono text-sm">{v.code}</div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-600">{v.is_suspended ? "suspendu" : v.status}</span>
        <form action={action}>
          <input type="hidden" name="voucher_id" value={v.id} />
          <input type="hidden" name="next" value={next.value} />
          <button type="submit" className="h-8 px-3 rounded-md border border-black/10 dark:border-white/10 text-xs">{next.label}</button>
        </form>
        <DeleteVoucherButton id={v.id} />
      </div>
    </div>
  );
}

function GenerateVoucherForm({ plans }: { plans: Array<{ id: string; name: string; max_businesses: number }> }) {
  async function action(formData: FormData) {
    "use server";
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("host") || "localhost:3000";
    const base = `${proto}://${host}`;
    const body = {
      plan_id: String(formData.get("plan_id") || "").trim(),
      expires_at: String(formData.get("expires_at") || "").trim() || null,
    };
    await fetch(`${base}/api/admin/vouchers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: h.get("cookie") || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  }

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-md border border-black/10 dark:border-white/10 p-3 mb-4">
      <select name="plan_id" className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm" required>
        <option value="">Sélectionnez un plan</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.max_businesses})
          </option>
        ))}
      </select>
      <div className="flex items-center justify-end">
        <button type="submit" className="h-9 px-3 rounded-md bg-orange-500 text-white hover:bg-orange-600 text-sm">Générer</button>
      </div>
    </form>
  );
}

function DeleteVoucherButton({ id }: { id: string }) {
  async function action() {
    "use server";
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("host") || "localhost:3000";
    const base = `${proto}://${host}`;
    const res = await fetch(`${base}/api/admin/vouchers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", cookie: h.get("cookie") || "" },
      body: JSON.stringify({ voucher_id: id }),
    });
  }
  return (
    <form action={action}>
      <button type="submit" className="h-8 px-3 rounded-md border border-red-300 text-red-600 text-xs">Supprimer</button>
    </form>
  );
}



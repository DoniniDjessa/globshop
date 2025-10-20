"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function AdminOwnersPage() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(formData: FormData) {
    const body = {
      full_name: String(formData.get("full_name") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
    };
    if (!body.full_name || (!body.email && !body.phone)) {
      toast.error("Nom et e‑mail ou téléphone requis");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/owners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          toast.success("Propriétaire créé. Mot de passe par défaut: 00000000");
          setForm({ full_name: "", email: "", phone: "" });
        } else {
          toast.error("Échec de création du propriétaire");
        }
      } catch {
        toast.error("Erreur réseau");
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-fira-condensed)" }}>Créer un propriétaire</h2>
      <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
        <input name="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Nom complet" className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5" required />
        <input name="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="E‑mail (optionnel si téléphone)" className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5" />
        <input name="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Téléphone (optionnel si e‑mail)" className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5" />
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" disabled={isPending} className="h-9 px-3 rounded-md bg-orange-500 text-white hover:bg-orange-600 text-sm">
            {isPending ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
      <p className="mt-2 text-xs text-zinc-600">Le propriétaire pourra se connecter avec le mot de passe initial "00000000" puis le modifier.</p>

      <OwnersList />
    </div>
  );
}

function OwnersList() {
  const [owners, setOwners] = useState<Array<{ id: string; full_name: string; email: string | null; phone: string | null; is_active: boolean; businesses: string[] }>>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/admin/owners", { cache: "no-store" });
      const data = await res.json();
      setOwners(data.owners || []);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    load();
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-fira-condensed)" }}>Propriétaires</h3>
      {loading ? (
        <div className="text-sm text-zinc-500">Chargement...</div>
      ) : owners.length === 0 ? (
        <div className="text-sm text-zinc-500">Aucun propriétaire pour le moment.</div>
      ) : (
        <div className="grid gap-2">
          {owners.map((u) => (
            <div key={u.id} className="rounded-md border border-black/10 dark:border-white/10 p-3">
              <div className="font-medium">{u.full_name}</div>
              <div className="text-xs text-zinc-600">{u.email || u.phone}</div>
              {u.businesses.length > 0 ? (
                <div className="text-xs text-zinc-600">Business: {u.businesses.join(", ")}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



"use client";

import { useState, useTransition, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { normalizePhone } from "@/lib/phone/normalize";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    voucher_code: "",
    // business creation deferred
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    // require at least one contact: email or phone
    if (!form.email && !form.phone) {
      setError("Veuillez renseigner un e‑mail ou un téléphone");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email || null, phone: form.phone ? normalizePhone(form.phone) : null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Inscription impossible");
        return;
      }
      startTransition(() => router.replace("/dashboard"));
    } catch {
      setError("Erreur réseau");
    }
  }

  return (
    <div className="min-h-[100svh] grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="w-full flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-fira-condensed)" }}>Inscription</h1>
          <p className="text-sm text-zinc-500 mb-6">Utilisez un code voucher pour créer votre business</p>
          {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nom complet</label>
              <input className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Téléphone</label>
              <input className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5 placeholder:text-xs" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Optionnel si e‑mail fourni" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">E‑mail</label>
              <input type="email" className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5 placeholder:text-xs" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Optionnel si téléphone fourni" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mot de passe</label>
              <input type="password" className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5 placeholder:text-xs" value={form.password} onChange={(e) => update("password", e.target.value)} required />
            </div>
          </div>
          {/* Business details will be captured later by the owner after onboarding */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Code voucher</label>
            <input className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-white/5 placeholder:text-xs" value={form.voucher_code} onChange={(e) => update("voucher_code", e.target.value)} required />
          </div>
            <button type="submit" disabled={isPending} className="w-full h-10 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
              {isPending ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" /> : null}
              Créer mon compte
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-zinc-600">
            Déjà inscrit ? <a href="/login" className="text-orange-600 hover:underline">Se connecter</a>
          </div>
        </div>
      </div>
      <div className="hidden md:block relative">
        <Image
          src="https://images.unsplash.com/photo-1519748771451-a94c596fad67?q=80&w=1600&auto=format&fit=crop"
          alt="Business"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}



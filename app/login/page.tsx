"use client";

import { useState, useTransition, FormEvent, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lastIdentifier");
      if (saved) setIdentifier(saved);
    } catch {}
  }, []);

  function handleIdentifierChange(value: string) {
    setIdentifier(value);
    try {
      window.localStorage.setItem("lastIdentifier", value);
    } catch {}
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid credentials");
        return;
      }
      const data = await res.json();
      try {
        window.localStorage.setItem("lastIdentifier", identifier);
      } catch {}
      const next = params.get("next");
      if (next) {
        startTransition(() => router.replace(next));
        return;
      }
      const target = data?.role === "super_admin" ? "/admin" : "/dashboard";
      startTransition(() => router.replace(target));
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 p-6 shadow-lg bg-white/90 dark:bg-zinc-900/80 backdrop-blur">
        <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-fira-condensed)" }}>Connexion</h1>
        <p className="text-sm text-zinc-500 mb-6">Utilisez votre e‑mail ou téléphone et votre mot de passe</p>
        {error ? (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">E‑mail ou téléphone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-400/30"
              placeholder="vous@exemple.com ou +237..."
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 pr-10 bg-transparent outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-400/30"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-700"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}



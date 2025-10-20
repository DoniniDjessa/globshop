"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      startTransition(() => router.replace("/login"));
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading || isPending}
      className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white/90 disabled:opacity-60"
    >
      {loading || isPending ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
      ) : (
        "Se déconnecter"
      )}
    </button>
  );
}



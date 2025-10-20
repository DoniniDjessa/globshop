"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreatePlanForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim() || null;
    const max_businesses = Number(formData.get("max_businesses") || 1);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/voucher-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, max_businesses }),
        });
        if (res.ok) {
          toast.success("Plan créé");
          router.refresh();
        } else {
          toast.error("Échec de création du plan");
        }
      } catch {
        toast.error("Erreur réseau");
      }
    });
  }

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-md border border-black/10 dark:border-white/10 p-3">
      <input name="name" placeholder="Nom du plan" className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2" required />
      <input name="max_businesses" type="number" min={1} defaultValue={1} className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2" />
      <div className="md:col-span-2">
        <input name="description" placeholder="Description (optionnelle)" className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2" />
      </div>
      <div className="md:col-span-1 flex items-center justify-end">
        <button type="submit" disabled={isPending} className="h-9 px-3 rounded-md bg-orange-500 text-white hover:bg-orange-600 text-sm">
          {isPending ? "Création..." : "Créer"}
        </button>
      </div>
    </form>
  );
}



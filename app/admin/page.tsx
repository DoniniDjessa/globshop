import LogoutButton from "@/components/auth/logout-button";

export default function AdminPage() {
  return (
    <div className="min-h-[100svh] p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fira-condensed)" }}>Administration</h1>
        <LogoutButton />
      </div>
      <p className="text-sm text-zinc-500">Bienvenue, super administrateur. Contenu à venir.</p>
    </div>
  );
}



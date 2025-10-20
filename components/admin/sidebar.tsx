"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutGrid, TicketPercent, Store, Settings2, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Accueil", icon: <LayoutGrid size={18} /> },
  { href: "/admin/businesses", label: "Business", icon: <Store size={18} /> },
  { href: "/admin/owners", label: "Créer propriétaire", icon: <Settings2 size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("adminSidebarCollapsed");
      if (saved != null) setCollapsed(saved === "1");
    } catch {}
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem("adminSidebarCollapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  return (
    <aside
      className={`h-screen sticky top-0 border-r border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur px-2 py-3 transition-[width] duration-200 ${
        collapsed ? "w-[64px]" : "w-[220px]"
      }`}
    >
      <button
        onClick={toggle}
        aria-label="Basculer le menu"
        className="w-full flex items-center justify-between rounded-md px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5"
      >
        <span className={`text-sm font-medium ${collapsed ? "opacity-0 pointer-events-none" : ""}`}>Menu</span>
        <ChevronRight className={`transition-transform ${collapsed ? "rotate-0" : "rotate-90"}`} size={16} />
      </button>

      <nav className="mt-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                active ? "bg-black/5 dark:bg-white/10" : ""
              }`}
              title={item.label}
            >
              <span className="shrink-0 opacity-80 group-hover:opacity-100">{item.icon}</span>
              <span className={`${collapsed ? "opacity-0 pointer-events-none" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}



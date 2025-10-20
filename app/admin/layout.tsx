import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] grid" style={{ gridTemplateColumns: "auto 1fr" }}>
      <AdminSidebar />
      <div className="p-6">{children}</div>
    </div>
  );
}



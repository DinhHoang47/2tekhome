import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
    >
      <AdminSidebar />
      <SidebarInset className="overflow-hidden">
        <div className="flex-1 flex flex-col mx-auto p-6 w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

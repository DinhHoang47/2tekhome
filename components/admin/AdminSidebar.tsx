"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  LayoutDashboard,
  FileText,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
  {
    title: "Tổng Quan",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Sản Phẩm",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Đơn Hàng",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Bài Viết",
    url: "/admin/articles",
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast.success("Đăng xuất thành công", {
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
      setTimeout(() => router.push("/admin/login"), 500);
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message || "Không thể đăng xuất",
      });
    },
  });

  const handleLogout = () => logoutMutation.mutate();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link
          href="/"
          className="flex items-center space-x-2"
          data-testid="link-admin-home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản Lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    data-testid={`link-admin-${item.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng Xuất"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

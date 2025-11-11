"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";
import type { Product, Order } from "@/shared/schema";

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  // --- Query data ---
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && isAdmin,
  });

  // --- Auth check ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Bạn cần đăng nhập để truy cập trang admin...",
        variant: "destructive",
      });
      setTimeout(() => router.push("/admin/login"), 500);
      return;
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang admin",
        variant: "destructive",
      });
      setTimeout(() => router.push("/"), 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, router, toast]);

  // --- Loading guard ---
  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  // --- Data calculation ---
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue =
    orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <h1 className="text-2xl font-bold">Tổng Quan</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Sản Phẩm
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sản phẩm trong kho
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Đơn Hàng
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đơn hàng đã nhận
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh Thu</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tổng giá trị đơn hàng
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Đơn Hàng Gần Đây</CardTitle>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerPhone} • {order.customerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {formatPrice(parseFloat(order.totalAmount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt!).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có đơn hàng nào
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

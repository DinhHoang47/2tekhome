"use client";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  customerEmail: z.string().email("Email không hợp lệ"),
  customerPhone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  shippingAddress: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        ...data,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: getCartTotal(cart).toString(),
      };
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      clearCart();
      toast.success("Đặt hàng thành công!", {
        description: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      });
      // Delay redirect to allow toast to be visible
      setTimeout(() => {
        router.push("/");
      }, 1500);
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message || "Không thể đặt hàng. Vui lòng thử lại.",
      });
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  const total = getCartTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h1 className="text-3xl font-bold">Giỏ hàng trống</h1>
              <p className="text-muted-foreground">
                Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
              </p>
              <Button
                onClick={() => router.push("/")}
                data-testid="button-back-to-shop"
              >
                Quay Lại Mua Sắm
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Thanh Toán</h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createOrderMutation.mutate(data)
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông Tin Giao Hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ và Tên *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nguyễn Văn A"
                                {...field}
                                data-testid="input-customer-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="email@example.com"
                                  {...field}
                                  data-testid="input-customer-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số Điện Thoại *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0912345678"
                                  {...field}
                                  data-testid="input-customer-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Địa Chỉ Giao Hàng *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                className="min-h-[100px]"
                                {...field}
                                data-testid="input-shipping-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi Chú (Tùy chọn)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ghi chú về đơn hàng của bạn"
                                className="min-h-[100px]"
                                {...field}
                                data-testid="input-notes"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-20">
                    <CardHeader>
                      <CardTitle>Đơn Hàng Của Bạn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex justify-between text-sm"
                            data-testid={`order-item-${item.product.id}`}
                          >
                            <span className="text-muted-foreground">
                              {item.product.name} x {item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatPrice(
                                (
                                  parseFloat(item.product.price) * item.quantity
                                ).toString()
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tạm tính
                          </span>
                          <span>{formatPrice(total.toString())}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Phí vận chuyển
                          </span>
                          <span className="text-green-600">Miễn phí</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span
                          className="text-primary"
                          data-testid="text-checkout-total"
                        >
                          {formatPrice(total.toString())}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={createOrderMutation.isPending}
                        data-testid="button-place-order"
                      >
                        {createOrderMutation.isPending
                          ? "Đang xử lý..."
                          : "Đặt Hàng"}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

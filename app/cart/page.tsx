"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";
import { useRouter } from "next/navigation";

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const updateCart = () => {
      setCart(getCart());
    };

    updateCart();
    window.addEventListener("cart-updated", updateCart);
    return () => window.removeEventListener("cart-updated", updateCart);
  }, []);

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
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Giỏ Hàng Trống</h1>
                <p className="text-muted-foreground">
                  Bạn chưa có sản phẩm nào trong giỏ hàng
                </p>
              </div>
              <Button
                onClick={() => router.push("/")}
                data-testid="button-continue-shopping"
              >
                Tiếp Tục Mua Sắm
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
          <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card
                  key={item.product.id}
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-base md:text-lg">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.product.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                            data-testid={`button-remove-${item.product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              data-testid={`button-decrease-${item.product.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span
                              className="w-12 text-center font-medium"
                              data-testid={`text-quantity-${item.product.id}`}
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.product.stock}
                              data-testid={`button-increase-${item.product.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-lg font-bold text-primary">
                            {formatPrice(
                              (
                                parseFloat(item.product.price) * item.quantity
                              ).toString()
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Tổng Đơn Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span data-testid="text-subtotal">
                        {formatPrice(total.toString())}
                      </span>
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
                    <span className="text-primary" data-testid="text-total">
                      {formatPrice(total.toString())}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => router.push("/checkout")}
                    data-testid="button-checkout"
                  >
                    Tiến Hành Thanh Toán
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push("/")}
                    data-testid="button-continue-shopping-summary"
                  >
                    Tiếp Tục Mua Sắm
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

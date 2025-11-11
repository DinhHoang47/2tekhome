"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft, Package, Truck, Shield } from "lucide-react";
import type { Product } from "@/shared/schema";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${quantity} x ${product.name} đã được thêm vào giỏ hàng`,
      });
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <Button
            variant="ghost"
            className="mb-6 gap-2 cursor-pointer"
            onClick={() => router.push("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay Lại
          </Button>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    data-testid="img-product"
                  />
                  {product.featured && (
                    <Badge
                      variant="destructive"
                      className="absolute top-4 right-4"
                    >
                      Nổi Bật
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1
                      className="text-3xl md:text-4xl font-bold"
                      data-testid="text-product-name"
                    >
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {product.category === "robot-vacuum"
                          ? "Robot Hút Bụi"
                          : "Thiết Bị Thông Minh"}
                      </Badge>
                      {product.stock > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Còn hàng
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Hết hàng</Badge>
                      )}
                    </div>
                  </div>

                  <p
                    className="text-3xl font-bold text-primary"
                    data-testid="text-price"
                  >
                    {formatPrice(product.price)}
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity & Add to Cart */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="font-medium">Số lượng:</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          data-testid="button-decrease-quantity"
                        >
                          -
                        </Button>
                        <span
                          className="w-12 text-center font-medium"
                          data-testid="text-quantity"
                        >
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity >= product.stock}
                          data-testid="button-increase-quantity"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {product.stock > 0 ? "Thêm Vào Giỏ Hàng" : "Hết Hàng"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Bảo hành</div>
                      <div className="text-muted-foreground">12 tháng</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Giao hàng</div>
                      <div className="text-muted-foreground">Miễn phí</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Chính hãng</div>
                      <div className="text-muted-foreground">100%</div>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Thông Số Kỹ Thuật</h3>
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b last:border-0"
                          >
                            <span className="text-muted-foreground">{key}</span>
                            <span className="font-medium text-right">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy sản phẩm
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/shared/schema";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "carousel";
}

export function ProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng`,
    });
  };

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));

  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden hover-elevate transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.featured && (
              <Badge
                className="absolute top-3 right-3"
                data-testid={`badge-featured-${product.id}`}
              >
                Nổi Bật
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <h3
                className="font-semibold text-base line-clamp-2"
                data-testid={`text-product-name-${product.id}`}
              >
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p
                className="text-2xl font-bold text-primary"
                data-testid={`text-price-${product.id}`}
              >
                {formatPrice(product.price)}
              </p>
              {product.stock > 0 ? (
                <Badge className="text-xs">Còn hàng</Badge>
              ) : (
                <Badge className="text-xs">Hết hàng</Badge>
              )}
            </div>
          </div>
        </CardContent>

        {variant === "default" && (
          <CardFooter className="p-4 pt-0">
            <Button
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock > 0 ? "Thêm Vào Giỏ" : "Hết Hàng"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

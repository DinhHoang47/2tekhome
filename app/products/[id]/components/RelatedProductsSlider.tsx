"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import type { Product } from "@/shared/schema";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface RelatedProductsSliderProps {
  currentProductId: string;
  category: string;
}

// Cấu hình cho slider
const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(parseFloat(price));
};

export function RelatedProductsSlider({
  currentProductId,
  category,
}: RelatedProductsSliderProps) {
  const router = useRouter();

  const { data: relatedProducts, isLoading: isLoadingRelated } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products/related", currentProductId, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        productId: currentProductId,
        category: category,
        limit: "10",
      });
      const response = await fetch(`/api/products/related?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch related products");
      }
      return response.json();
    },
    enabled: !!currentProductId && !!category,
  });

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  if (isLoadingRelated) {
    return <RelatedProductsSkeleton />;
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không có sản phẩm liên quan</p>
      </div>
    );
  }

  return (
    <Slider {...sliderSettings}>
      {relatedProducts.map((product) => (
        <div key={product.id} className="px-2">
          <Card
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full"
            onClick={() => handleProductClick(product.id)}
          >
            <CardContent className="p-4 flex flex-col h-full">
              {/* Product Image */}
              <div className="relative aspect-square mb-3 shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                {product.featured && (
                  <Badge
                    className="absolute top-3 right-3 bg-linear-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                    data-testid={`badge-featured-${product.id}`}
                  >
                    Nổi Bật
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col grow">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 grow">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-primary font-bold text-base">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Stock Status */}
                <div className="mt-auto">
                  {product.stock > 0 ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 text-xs"
                    >
                      Còn hàng
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Hết hàng
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </Slider>
  );
}

// Skeleton Loading Component
function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <Skeleton className="aspect-square w-full mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

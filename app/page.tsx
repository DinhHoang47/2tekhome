"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Product } from "@/shared/schema";
import { Search, Bot, Sparkles, DollarSign } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

function FeaturedProductsCarousel({ products }: { products: Product[] }) {
  // Duplicate products nhiều lần để tạo infinite scroll effect mượt
  const duplicatedProducts = [
    ...products,
    ...products,
    ...products,
    ...products,
    ...products,
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 2500, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap() % products.length);
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, products.length]);

  return (
    <section className="py-20  from-muted/30 to-background relative overflow-hidden">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Sản Phẩm Nổi Bật</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Những sản phẩm được yêu thích nhất từ khách hàng
          </p>
        </div>

        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden px-4" ref={emblaRef}>
            <div className="flex gap-6 md:gap-8">
              {duplicatedProducts.map((product, index) => {
                const normalizedIndex = index % products.length;
                const isActive = normalizedIndex === selectedIndex;
                const isPrev =
                  normalizedIndex ===
                  (selectedIndex - 1 + products.length) % products.length;
                const isNext =
                  normalizedIndex === (selectedIndex + 1) % products.length;

                return (
                  <div
                    key={`${product.id}-${index}`}
                    className={`
                      flex-[0_0_70%] min-w-0 
                      sm:flex-[0_0_55%] 
                      md:flex-[0_0_38%] 
                      lg:flex-[0_0_28%]
                      transition-all duration-700 ease-out
                      ${
                        isActive
                          ? "scale-105 opacity-100 z-20"
                          : "scale-90 opacity-60 z-10"
                      }
                      ${isPrev || isNext ? "md:scale-95 md:opacity-80" : ""}
                    `}
                  >
                    <div
                      className={`
                      transition-all duration-700 ease-out
                      ${
                        isActive
                          ? "md:scale-110 md:-translate-y-6 shadow-2xl shadow-primary/20"
                          : ""
                      }
                    `}
                    >
                      <ProductCard product={product} variant="carousel" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {products.map((_, index) => (
              <button
                key={index}
                className={`
                  h-2.5 rounded-full transition-all duration-300
                  ${
                    index === selectedIndex
                      ? "w-10 bg-primary shadow-lg shadow-primary/50"
                      : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }
                `}
                onClick={() => emblaApi?.scrollTo(index)}
                data-testid={`carousel-dot-${index}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative gradient overlays for depth */}
      <div className="absolute left-0 top-0 bottom-0 w-32 from-muted/30 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32  from-muted/30 to-transparent pointer-events-none z-10" />
    </section>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    let matchesPrice = true;
    if (priceFilter !== "all") {
      const price = parseFloat(product.price);
      if (priceFilter === "under-5m") matchesPrice = price < 5000000;
      else if (priceFilter === "5m-10m")
        matchesPrice = price >= 5000000 && price < 10000000;
      else if (priceFilter === "over-10m") matchesPrice = price >= 10000000;
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const featuredProducts = products?.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/image.png"
              alt="Smart home lifestyle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0  from-black/70 to-black/30" />
          </div>
          <div className="relative container h-full flex items-center">
            <div className="max-w-2xl space-y-6 text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Nâng Tầm Không Gian Sống
              </h1>
              <p className="text-lg md:text-xl text-gray-200">
                Khám phá bộ sưu tập robot hút bụi và thiết bị gia dụng thông
                minh cao cấp. Công nghệ hiện đại cho ngôi nhà của bạn.
              </p>
              <div className="flex flex-wrap gap-4"></div>
            </div>
          </div>
        </section>

        {/* Featured Products Carousel */}
        {featuredProducts && featuredProducts.length > 0 && (
          <FeaturedProductsCarousel products={featuredProducts} />
        )}

        {/* Products Section */}
        <section id="products-section" className="py-16">
          <div className="container">
            <div className="space-y-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Tất Cả Sản Phẩm</h2>
                  {filteredProducts && (
                    <Badge className="text-sm">
                      {filteredProducts.length} sản phẩm
                    </Badge>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                    data-testid="input-search"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Danh Mục Sản Phẩm</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card
                      className={`p-4 cursor-pointer transition-all hover-elevate ${
                        categoryFilter === "all"
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setCategoryFilter("all")}
                      data-testid="filter-category-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Tất Cả</p>
                            <p className="text-sm text-muted-foreground">
                              {products?.length || 0} sản phẩm
                            </p>
                          </div>
                        </div>
                        {categoryFilter === "all" && <Badge>✓</Badge>}
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover-elevate ${
                        categoryFilter === "robot-vacuum"
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setCategoryFilter("robot-vacuum")}
                      data-testid="filter-category-robot-vacuum"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">Robot Hút Bụi</p>
                            <p className="text-sm text-muted-foreground">
                              {products?.filter(
                                (p) => p.category === "robot-vacuum"
                              ).length || 0}{" "}
                              sản phẩm
                            </p>
                          </div>
                        </div>
                        {categoryFilter === "robot-vacuum" && <Badge>✓</Badge>}
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover-elevate ${
                        categoryFilter === "smart-device"
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setCategoryFilter("smart-device")}
                      data-testid="filter-category-smart-device"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium">Thiết Bị Thông Minh</p>
                            <p className="text-sm text-muted-foreground">
                              {products?.filter(
                                (p) => p.category === "smart-device"
                              ).length || 0}{" "}
                              sản phẩm
                            </p>
                          </div>
                        </div>
                        {categoryFilter === "smart-device" && <Badge>✓</Badge>}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Khoảng Giá</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      className="justify-start h-auto py-3 px-4"
                      onClick={() => setPriceFilter("all")}
                      data-testid="filter-price-all"
                    >
                      <div className="text-left">
                        <p className="font-medium">Tất Cả</p>
                        <p className="text-xs opacity-80">Mọi mức giá</p>
                      </div>
                    </Button>
                    <Button
                      className="justify-start h-auto py-3 px-4"
                      onClick={() => setPriceFilter("under-5m")}
                      data-testid="filter-price-under-5m"
                    >
                      <div className="text-left">
                        <p className="font-medium">Dưới 5tr</p>
                        <p className="text-xs opacity-80">Tiết kiệm</p>
                      </div>
                    </Button>
                    <Button
                      className="justify-start h-auto py-3 px-4"
                      onClick={() => setPriceFilter("5m-10m")}
                      data-testid="filter-price-5m-10m"
                    >
                      <div className="text-left">
                        <p className="font-medium">5tr - 10tr</p>
                        <p className="text-xs opacity-80">Phổ thông</p>
                      </div>
                    </Button>
                    <Button
                      className="justify-start h-auto py-3 px-4"
                      onClick={() => setPriceFilter("over-10m")}
                      data-testid="filter-price-over-10m"
                    >
                      <div className="text-left">
                        <p className="font-medium">Trên 10tr</p>
                        <p className="text-xs opacity-80">Cao cấp</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Không tìm thấy sản phẩm nào
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

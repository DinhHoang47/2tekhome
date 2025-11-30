"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product } from "@/shared/schema";
import { addToCart } from "@/lib/cart";
import { useState, useEffect } from "react";
import Image from "next/image";
import ZaloLogo from "@/app/assets/icons/zalo-logo.webp";
import { RelatedProductsSlider } from "./components/RelatedProductsSlider";
import { toast } from "sonner";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "description">("specs");

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
      toast.success("Đã thêm vào giỏ hàng", {
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

  const nextImage = () => {
    if (product?.images) {
      setSelectedImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // Get the current image to display
  const getCurrentImage = () => {
    if (!product) return "";

    if (product.images && product.images.length > 0) {
      return product.images[selectedImageIndex];
    }

    return product.imageUrl;
  };

  // Get all available images
  const getAllImages = () => {
    if (!product) return [];

    if (product.images && product.images.length > 0) {
      return product.images;
    }

    return [product.imageUrl];
  };

  // Render HTML content safely
  const renderHTMLContent = (content: string) => {
    return { __html: content };
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
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Product Images Section */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <img
                      src={getCurrentImage()}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      data-testid="img-product-main"
                    />

                    {/* Navigation Arrows - Only show if multiple images */}
                    {getAllImages().length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter - Only show if multiple images */}
                    {getAllImages().length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {selectedImageIndex + 1} / {getAllImages().length}
                      </div>
                    )}

                    {product.featured && (
                      <Badge
                        className="absolute top-3 right-3 bg-linear-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                        data-testid={`badge-featured-${product.id}`}
                      >
                        Nổi Bật
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail Images - Only show if multiple images */}
                  {getAllImages().length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {getAllImages().map((image, index) => (
                        <button
                          key={index}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedImageIndex
                              ? "border-primary ring-2 ring-primary"
                              : "border-muted hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`${product.name} - Hình ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
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

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Shield className="h-5 w-5 text-primary" />

                      <div className="text-sm">
                        <div className="font-medium">Chính hãng</div>
                        <div className="text-muted-foreground">100%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                      <div className="text-sm">
                        <div className="font-medium">Bảo hành</div>
                        <div className="text-muted-foreground">Toàn quốc</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Truck className="h-5 w-5 text-primary" />
                      <div className="text-sm">
                        <div className="font-medium">Giao hàng</div>
                        <div className="text-muted-foreground">Miễn phí</div>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      className="w-full gap-2 bg-white text-green-500 border-green-700 border cursor-pointer hover:bg-white"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Mua ngay
                    </Button>
                    <Button
                      onClick={() =>
                        window.open("https://zalo.me/0353645154", "_blank")
                      }
                      size="lg"
                      className="w-full gap-2  hover:bg-blue-700"
                    >
                      <Image src={ZaloLogo} alt="Zalo" className="h-5 w-5" />
                      Liên hệ qua Zalo
                    </Button>
                  </div>
                  {/* Quantity & Add to Cart */}
                  <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="font-medium">Số lượng:</label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setQuantity(Math.max(1, quantity - 1))
                            }
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
                        className=" gap-2 cursor-pointer"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        data-testid="button-add-to-cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {product.stock > 0 ? "Thêm Vào Giỏ Hàng" : "Hết Hàng"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Product Details Tabs Section */}
              <section className="mt-12">
                <Card>
                  <CardContent className="p-0">
                    {/* Tabs Navigation */}
                    <div className="border-b">
                      <div className="flex space-x-8 px-6">
                        <button
                          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === "specs"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setActiveTab("specs")}
                        >
                          Thông Số Kỹ Thuật
                        </button>
                        <button
                          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === "description"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setActiveTab("description")}
                        >
                          Giới Thiệu Sản Phẩm
                        </button>
                      </div>
                    </div>

                    {/* Tabs Content */}
                    <div className="p-6">
                      {activeTab === "specs" && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">
                            Thông Số Kỹ Thuật
                          </h3>
                          <div className="space-y-3">
                            {Object.entries(product.specifications).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between py-2 border-b last:border-0"
                                >
                                  <span className="text-muted-foreground">
                                    {key}
                                  </span>
                                  <span className="font-medium text-right">
                                    {typeof value === "object"
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "description" && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">
                            Giới Thiệu Sản Phẩm
                          </h3>
                          <div className="prose prose-lg max-w-none">
                            {product.descriptionContent ? (
                              <div
                                className="product-description-content"
                                dangerouslySetInnerHTML={renderHTMLContent(
                                  product.descriptionContent
                                )}
                              />
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>
                                  Nội dung giới thiệu sản phẩm đang được cập
                                  nhật...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Related Products Section */}
              <section className="mt-16 mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Sản Phẩm Liên Quan</h2>
                </div>

                <RelatedProductsSlider
                  currentProductId={product.id}
                  category={product.category}
                />
              </section>
            </>
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

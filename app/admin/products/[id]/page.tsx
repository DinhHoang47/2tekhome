"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2, X, Star, StarOff } from "lucide-react";
import type { Product } from "@/shared/schema";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { MarkdownEditorWithUpload } from "../../articles/[id]/edit/components/MarkdownEditor";

export default function ProductEditPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isCreating = productId === "new";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    descriptionContent: "", // Thêm field mới
    price: "",
    category: "robot-vacuum",
    imageUrl: "",
    images: [] as string[],
    stock: 0,
    featured: false,
    specifications: {} as Record<string, string>,
  });

  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Unauthorized", {
        description: "Bạn cần đăng nhập để truy cập trang admin...",
      });
      setTimeout(() => {
        router.push("/admin/login");
      }, 500);
      return;
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      toast.error("Không có quyền truy cập", {
        description: "Bạn không có quyền truy cập trang admin",
      });
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  // Fetch product data if editing
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !isCreating,
  });

  // Populate form when product data is loaded
  useEffect(() => {
    if (product && !isCreating) {
      setFormData({
        name: product.name,
        description: product.description,
        descriptionContent: product.descriptionContent || "", // Thêm field mới
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        images: product.images || [],
        stock: product.stock,
        featured: product.featured,
        specifications: product.specifications,
      });
    }
  }, [product, isCreating]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast.success("Thành công", {
        description: "Đã tạo sản phẩm mới",
      });
      router.push("/admin/products");
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", `/api/admin/products/${productId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${productId}`],
      });
      toast.success("Thành công", {
        description: "Đã cập nhật sản phẩm",
      });
      router.push("/admin/products");
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: { ...formData.specifications, [specKey]: specValue },
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleAddImage = (url: string) => {
    console.log("Adding additional image:", url);
    if (url && !formData.images.includes(url) && url !== formData.imageUrl) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
      toast.success("Thành công", {
        description: "Đã thêm ảnh bổ sung",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const handleSetAsPrimary = (imageUrl: string) => {
    const newImages = formData.images.filter((img) => img !== imageUrl);
    setFormData({
      ...formData,
      imageUrl: imageUrl,
      images: newImages,
    });
    toast.success("Thành công", {
      description: "Đã đặt làm ảnh đại diện",
    });
  };

  const handleBack = () => {
    router.push("/admin/products");
  };

  const isUploading = isUploadingPrimary || isUploadingAdditional;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  if (!isCreating && productLoading) {
    return <p>Đang tải thông tin sản phẩm...</p>;
  }
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isCreating ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"}
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên Sản Phẩm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              data-testid="input-product-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả Ngắn *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              required
              placeholder="Mô tả ngắn gọn về sản phẩm, hiển thị ở trang danh sách sản phẩm"
              data-testid="input-product-description"
            />
          </div>

          {/* Nội dung giới thiệu sản phẩm với Markdown Editor */}
          <div className="space-y-2">
            <Label>Nội Dung Giới Thiệu Chi Tiết</Label>
            <MarkdownEditorWithUpload
              value={formData.descriptionContent}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  descriptionContent: value,
                })
              }
              height={500}
              placeholder="Nhập nội dung chi tiết về sản phẩm, tính năng, hướng dẫn sử dụng..."
              folder="2tek-home/products"
            />
            <p className="text-sm text-muted-foreground">
              Nội dung này sẽ hiển thị ở tab "Giới Thiệu Sản Phẩm" trên trang
              chi tiết sản phẩm. Hỗ trợ định dạng Markdown và upload ảnh.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VND) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                data-testid="input-product-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Số Lượng *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value),
                  })
                }
                required
                data-testid="input-product-stock"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Danh Mục *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: string) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger data-testid="select-product-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="robot-vacuum">Robot Hút Bụi</SelectItem>
                <SelectItem value="smart-device">
                  Thiết Bị Thông Minh
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Image Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <Label className="text-lg font-semibold">Ảnh Đại Diện *</Label>
            <p className="text-sm text-muted-foreground">
              Ảnh chính sẽ hiển thị ở trang danh sách sản phẩm
            </p>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, imageUrl: url }))
              }
              folder="2tek-home/products"
              nameHint={
                formData.name
                  ? `product-primary-${formData.name
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`
                  : "product-primary"
              }
              disabled={isSubmitting || isUploading}
              buttonText={
                formData.imageUrl
                  ? "Thay đổi ảnh đại diện"
                  : "Chọn ảnh đại diện"
              }
              onUploadStart={() => setIsUploadingPrimary(true)}
              onUploadEnd={() => setIsUploadingPrimary(false)}
              previewClassName="w-48 h-48 object-cover rounded-lg border-2 border-primary"
              showUrlInput={true}
            />
          </div>

          {/* Additional Images Section */}
          <div className="space-y-4">
            <Label>Ảnh Bổ Sung</Label>
            <div className="space-y-4">
              <ImageUpload
                value=""
                onChange={handleAddImage}
                folder="2tek-home/products"
                nameHint={
                  formData.name
                    ? `product-additional-${formData.name
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`
                    : "product-additional"
                }
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  isUploading
                }
                buttonText="Thêm Ảnh Bổ Sung"
                onUploadStart={() => setIsUploadingAdditional(true)}
                onUploadEnd={() => setIsUploadingAdditional(false)}
                label=""
              />

              {/* Display additional images */}
              {formData.images.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    {formData.images.length} ảnh bổ sung
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Ảnh bổ sung ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSetAsPrimary(image)}
                            className="h-8 px-2 text-xs bg-white text-black hover:bg-gray-200"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Đặt chính
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            className="h-8 w-8 p-0 bg-white text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
              data-testid="switch-product-featured"
            />
            <Label htmlFor="featured">Sản phẩm nổi bật</Label>
          </div>

          <div className="space-y-2">
            <Label>Thông Số Kỹ Thuật</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Tên thông số"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                data-testid="input-spec-key"
              />
              <Input
                placeholder="Giá trị"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                data-testid="input-spec-value"
              />
              <Button
                type="button"
                onClick={addSpecification}
                data-testid="button-add-spec"
              >
                Thêm
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="text-sm">
                    <strong>{key}:</strong> {value}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecification(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                isUploading
              }
              data-testid="button-submit-product"
            >
              {isCreating ? "Tạo Mới" : "Cập Nhật"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

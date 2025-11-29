"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import type { Product } from "@/shared/schema";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";

export default function AdminProducts() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "robot-vacuum",
    imageUrl: "",
    stock: 0,
    featured: false,
    specifications: {} as Record<string, string>,
  });

  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

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
  }, [isAuthenticated, isLoading, isAdmin, toast, router]);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast.success("Thành công", {
        description: "Đã tạo sản phẩm mới",
      });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest("PUT", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast.success("Thành công", {
        description: "Đã cập nhật sản phẩm",
      });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/products/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast.success("Thành công", {
        description: "Đã xóa sản phẩm",
      });
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "robot-vacuum",
      imageUrl: "",
      stock: 0,
      featured: false,
      specifications: {},
    });
    setEditingProduct(null);
    setIsUploadingImage(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
      featured: product.featured,
      specifications: product.specifications,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
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

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="text-2xl font-bold">Quản Lý Sản Phẩm</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Sản Phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="description">Mô Tả *</Label>
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
                  data-testid="input-product-description"
                />
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

              {/* Upload Image Section */}
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, imageUrl: url }))
                }
                folder="2tek-home/products"
                nameHint={
                  formData.name
                    ? `product-${formData.name
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`
                    : "product"
                }
                disabled={createMutation.isPending || updateMutation.isPending}
                label="Hình Ảnh Sản Phẩm *"
              ></ImageUpload>

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
                  {Object.entries(formData.specifications).map(
                    ([key, value]) => (
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
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    isUploadingImage
                  }
                  data-testid="button-submit-product"
                >
                  {editingProduct ? "Cập Nhật" : "Tạo Mới"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {productsLoading ? (
          <p>Đang tải...</p>
        ) : products && products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Kho</TableHead>
                <TableHead>Nổi Bật</TableHead>
                <TableHead>Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  data-testid={`row-product-${product.id}`}
                >
                  <TableCell>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category === "robot-vacuum"
                      ? "Robot Hút Bụi"
                      : "Thiết Bị Thông Minh"}
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.featured ? "Có" : "Không"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(product.id)}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Chưa có sản phẩm nào
          </p>
        )}
      </main>
    </div>
  );
}

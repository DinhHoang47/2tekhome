"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import type { Article } from "@/shared/schema";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminArticles() {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "draft",
    authorId: "",
  });

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

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        authorId: user?.id || "",
        publishedAt:
          data.status === "published" ? new Date().toISOString() : null,
      };
      return await apiRequest("POST", "/api/admin/articles", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast.success("Thành công", {
        description: "Đã tạo bài viết mới",
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
      return await apiRequest("DELETE", `/api/admin/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast.success("Thành công", {
        description: "Đã xóa bài viết",
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
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featuredImage: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      status: "draft",
      authorId: "",
    });
  };

  const handleEdit = (article: Article) => {
    router.push(`/admin/articles/${article.id}/edit`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="text-2xl font-bold">Quản Lý Bài Viết</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Quản lý bài viết blog để tối ưu SEO
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-article">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Bài Viết
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm Bài Viết Mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu Đề *</Label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Tiêu đề bài viết"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    data-testid="input-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                    placeholder="slug-bai-viet"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL: /blog/{formData.slug || "slug-bai-viet"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Tóm Tắt</Label>
                  <Textarea
                    id="excerpt"
                    data-testid="input-excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn về bài viết"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Nội Dung * (Markdown)</Label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger
                        value="edit"
                        className="flex-1"
                        data-testid="tab-edit"
                      >
                        Chỉnh Sửa
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="flex-1"
                        data-testid="tab-preview"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem Trước
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="mt-2">
                      <Textarea
                        id="content"
                        data-testid="input-content"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: e.target.value,
                          })
                        }
                        required
                        rows={16}
                        placeholder="Nội dung bài viết (hỗ trợ Markdown)&#10;&#10;# Tiêu đề&#10;## Tiêu đề phụ&#10;**Chữ đậm** *Chữ nghiêng*&#10;- Danh sách&#10;1. Danh sách đánh số"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Hỗ trợ Markdown: # Tiêu đề, **đậm**, *nghiêng*,
                        [link](url), ![ảnh](url)
                      </p>
                    </TabsContent>
                    <TabsContent value="preview" className="mt-2">
                      <div className="border rounded-md p-4 min-h-[400px] bg-muted/30">
                        {formData.content ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{formData.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-8">
                            Nội dung preview sẽ hiển thị ở đây
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="featuredImage">URL Ảnh Đại Diện</Label>
                  <Input
                    id="featuredImage"
                    data-testid="input-featured-image"
                    value={formData.featuredImage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredImage: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <ImageUpload
                  value={formData.featuredImage}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, featuredImage: url }))
                  }
                  folder="2tek-home/products"
                  nameHint={
                    formData.slug
                      ? `article-${formData.slug
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`
                      : "article-image"
                  }
                  disabled={createMutation.isPending}
                  label="Ảnh Bìa *"
                ></ImageUpload>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">SEO Metadata</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        data-testid="input-meta-title"
                        value={formData.metaTitle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaTitle: e.target.value,
                          })
                        }
                        placeholder="Tiêu đề SEO (để trống sẽ dùng tiêu đề bài viết)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        data-testid="input-meta-description"
                        value={formData.metaDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaDescription: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Mô tả SEO cho Google"
                      />
                    </div>

                    <div>
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Input
                        id="metaKeywords"
                        data-testid="input-meta-keywords"
                        value={formData.metaKeywords}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaKeywords: e.target.value,
                          })
                        }
                        placeholder="robot hút bụi, smart home, thiết bị thông minh"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Trạng Thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="published">Xuất Bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    Tạo Bài Viết
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {articlesLoading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : !articles || articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có bài viết nào
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu Đề</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Ngày Xuất Bản</TableHead>
                  <TableHead>Cập Nhật</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow
                    key={article.id}
                    data-testid={`row-article-${article.id}`}
                  >
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {article.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          article.status === "published"
                            ? "default"
                            : "secondary"
                        }
                        data-testid={`badge-status-${article.id}`}
                      >
                        {article.status === "published" ? "Xuất Bản" : "Nháp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {article.publishedAt
                        ? format(new Date(article.publishedAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(article.updatedAt!), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(article)}
                          data-testid={`button-edit-${article.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn xóa bài viết này?"
                              )
                            ) {
                              deleteMutation.mutate(article.id);
                            }
                          }}
                          data-testid={`button-delete-${article.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import type { Article } from "@/shared/schema";
import ReactMarkdown from "react-markdown";
import { ImageUpload } from "@/components/ImageUpload";
import { MarkdownEditorWithUpload } from "./components/MarkdownEditor";
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

export default function EditArticlePage() {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

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

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, toast, router]);

  // Fetch article data
  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/admin/articles/${articleId}`],
    enabled: !!articleId,
  });

  // Update form when article data is loaded
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || "",
        featuredImage: article.featuredImage || "",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        metaKeywords: article.metaKeywords || "",
        status: article.status,
        authorId: article.authorId || user?.id || "",
      });
    }
  }, [article, user]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const existingArticle = article;
      const wasPublished = existingArticle?.status === "published";
      const nowPublishing = data.status === "published";

      const payload = {
        ...data,
        publishedAt:
          !wasPublished && nowPublishing
            ? new Date().toISOString()
            : existingArticle?.publishedAt,
      };
      return await apiRequest(
        "PUT",
        `/api/admin/articles/${articleId}`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/articles/${articleId}`],
      });
      toast.success("Thành công", {
        description: "Đã cập nhật bài viết",
      });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error("Lỗi", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateMutation.mutate(formData);
  };

  const handleBack = () => {
    router.push("/admin/articles");
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  if (articleLoading) {
    return (
      <div className="flex flex-col flex-1">
        <header className="flex items-center gap-4 p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Chỉnh Sửa Bài Viết</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Đang tải...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col flex-1">
        <header className="flex items-center gap-4 p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Chỉnh Sửa Bài Viết</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Bài viết không tồn tại</p>
            <Button onClick={handleBack} className="mt-4">
              Quay lại
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh Sửa Bài Viết</h1>
          <Badge
            variant={article.status === "published" ? "default" : "secondary"}
            data-testid="badge-status"
          >
            {article.status === "published" ? "Xuất Bản" : "Nháp"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            data-testid="button-cancel"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="button-save"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu Thay Đổi
          </Button>
          <a
            href={`${window.location.origin}/blog/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              onClick={handleBack}
              data-testid="button-cancel"
            >
              Xem trước
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 gap-6">
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
              <MarkdownEditorWithUpload
                folder="2tek-home/articles"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Viết nội dung chi tiết của bài viết..."
              />
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
              folder="2tek-home/articles"
              nameHint={
                formData.slug
                  ? `article-${formData.slug
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`
                  : "article-image"
              }
              disabled={isSubmitting}
              label="Ảnh Bìa"
            />

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 text-lg">SEO Metadata</h3>

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
          </div>
        </form>
      </main>
    </div>
  );
}

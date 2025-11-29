// components/ui/ImageUploadForEditor.tsx
"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadForEditorProps {
  onInsert: (
    markdown: string,
    position?: { start: number; end: number }
  ) => void;
  folder?: string;
  disabled?: boolean;
  cursorPosition?: { start: number; end: number };
}

export function ImageUploadForEditor({
  onInsert,
  folder = "2tek-home/articles",
  disabled = false,
  cursorPosition,
}: ImageUploadForEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // Thêm state để lưu URL ảnh đã upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Lỗi", {
        description: "Vui lòng chọn file hình ảnh",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Lỗi", {
        description: "Kích thước file không được vượt quá 5MB",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("nameHint", "editor");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        // Lưu URL ảnh đã upload nhưng KHÔNG đóng modal
        setUploadedImageUrl(data.url);

        toast.success("Thành công", {
          description:
            "Ảnh đã được tải lên thành công. Bạn có thể chèn vào bài viết hoặc tải ảnh khác.",
        });
      } else {
        throw new Error(data.error || "Đã xảy ra lỗi khi upload");
      }
    } catch (error) {
      toast.error("Upload thất bại", {
        description:
          error instanceof Error ? error.message : "Đã xảy ra lỗi khi upload",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertUploadedImage = () => {
    if (!uploadedImageUrl) return;

    const markdown = `![${imageDescription || "Ảnh"}](${uploadedImageUrl})`;
    onInsert(markdown, cursorPosition); // Truyền cursorPosition
    handleCloseModal();
  };

  const handleManualInsert = () => {
    if (!manualUrl.trim()) {
      toast.error("Lỗi", {
        description: "Vui lòng nhập URL hình ảnh",
      });
      return;
    }

    const markdown = `![${imageDescription || "Ảnh"}](${manualUrl})`;
    onInsert(markdown, cursorPosition); // Truyền cursorPosition
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setManualUrl("");
    setImageDescription("");
    setUploadedImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        } else {
          setIsDialogOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Chèn Ảnh
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chèn hình ảnh vào bài viết</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Ảnh</TabsTrigger>
            <TabsTrigger value="url">URL Ảnh</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Preview ảnh đã upload */}
            {uploadedImageUrl && (
              <div className="space-y-2 p-3 border border-green-200 bg-green-50 rounded-md">
                <Label className="text-green-700">
                  ✅ Ảnh đã upload thành công!
                </Label>
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={uploadedImageUrl}
                    alt="Preview"
                    className="max-h-32 object-cover rounded-md border"
                  />
                  <Button
                    onClick={handleInsertUploadedImage}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Chèn ảnh này vào bài viết
                  </Button>
                </div>
                <div className="border-t pt-2 mt-2">
                  <Label>Hoặc upload ảnh khác:</Label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả ảnh (tùy chọn)</Label>
              <Input
                id="description"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Nhập mô tả cho ảnh..."
              />
            </div>

            <div className="space-y-2">
              <Label>Chọn ảnh từ máy tính</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleImageUpload(file);
                  }
                }}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                Hỗ trợ: JPG, PNG, GIF, WebP (Tối đa 5MB)
              </p>
            </div>

            {isUploading && (
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <Upload className="h-4 w-4 animate-pulse" />
                Đang tải ảnh lên...
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description-url">Mô tả ảnh (tùy chọn)</Label>
              <Input
                id="description-url"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Nhập mô tả cho ảnh..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">URL hình ảnh</Label>
              <Input
                id="image-url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleManualInsert}
                className="flex-1"
                disabled={!manualUrl.trim()}
              >
                <Link className="h-4 w-4 mr-2" />
                Chèn Ảnh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setManualUrl("");
                  setImageDescription("");
                }}
              >
                Reset
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

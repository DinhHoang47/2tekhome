// components/ui/ImageUpload.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  nameHint?: string;
  disabled?: boolean;
  label?: string;
  previewClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "2tek-home/products",
  nameHint = "image",
  disabled = false,
  label = "Hình Ảnh",
  previewClassName = "w-32 h-32 object-cover rounded-md",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

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
      formData.append("nameHint", nameHint);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        onChange(data.url);
        toast.success("Thành công", {
          description: "Ảnh đã được tải lên thành công",
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

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await handleImageUpload(file);
              }
            }}
            disabled={disabled || isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            onClick={() =>
              document
                .querySelector<HTMLInputElement>('input[type="file"]')
                ?.click()
            }
          >
            <Upload className="h-4 w-4 mr-2" />
            Chọn Ảnh
          </Button>
        </div>

        {isUploading && (
          <div className="text-sm text-blue-600">Đang tải lên...</div>
        )}

        {/* Image Preview */}
        {value && (
          <div className="mt-2">
            <Label>Preview:</Label>
            <div className="mt-1 p-2 border rounded-md">
              <img src={value} alt="Preview" className={previewClassName} />
            </div>
          </div>
        )}

        {/* Manual URL Input as fallback */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Hoặc nhập URL hình ảnh:</Label>
          <Input
            id="imageUrl"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

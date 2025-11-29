// components/editor/MarkdownEditorWithUpload.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { ImageUploadForEditor } from "./ImageUploadForEditor";

interface MarkdownEditorWithUploadProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
  folder?: string;
}

export function MarkdownEditorWithUpload({
  value,
  onChange,
  height = 400,
  placeholder = "Viết nội dung bài viết của bạn...",
  folder = "2tek-home/articles",
}: MarkdownEditorWithUploadProps) {
  const [cursorPosition, setCursorPosition] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });
  const editorRef = useRef<any>(null);

  // Hàm cập nhật vị trí con trỏ
  const updateCursorPosition = useCallback(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      setCursorPosition({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      });
      console.log("MDEditor Cursor:", {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      });
    }
  }, []);

  // Thiết lập event listeners cho textarea
  useEffect(() => {
    const setupEventListeners = () => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.addEventListener("click", updateCursorPosition);
        textarea.addEventListener("keyup", updateCursorPosition);
        textarea.addEventListener("mouseup", updateCursorPosition);
        textarea.addEventListener("select", updateCursorPosition);
        textarea.addEventListener("focus", updateCursorPosition);

        // Cũng cập nhật khi user gõ phím
        textarea.addEventListener("input", updateCursorPosition);
      }
    };

    // Sử dụng MutationObserver để theo dõi khi textarea được render/re-render
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          setupEventListeners();
        }
      });
    });

    // Bắt đầu quan sát
    const editorContainer = document.querySelector('[data-color-mode="light"]');
    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true,
      });
    }

    // Thiết lập ban đầu
    setTimeout(setupEventListeners, 100);

    return () => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.removeEventListener("click", updateCursorPosition);
        textarea.removeEventListener("keyup", updateCursorPosition);
        textarea.removeEventListener("mouseup", updateCursorPosition);
        textarea.removeEventListener("select", updateCursorPosition);
        textarea.removeEventListener("focus", updateCursorPosition);
        textarea.removeEventListener("input", updateCursorPosition);
      }
      observer.disconnect();
    };
  }, [updateCursorPosition, value]);

  const handleInsertImage = (
    markdownImage: string,
    position = cursorPosition
  ) => {
    console.log("Inserting image at:", position);

    const { start, end } = position;

    // Chèn ảnh vào vị trí con trỏ
    const newValue =
      value.substring(0, start) + markdownImage + value.substring(end);
    onChange(newValue);

    // Cập nhật vị trí con trỏ sau khi chèn
    const newCursorPos = start + markdownImage.length;
    setTimeout(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition({ start: newCursorPos, end: newCursorPos });
      }
    }, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Nội dung bài viết</label>
        <ImageUploadForEditor
          folder={folder}
          onInsert={handleInsertImage}
          cursorPosition={cursorPosition}
        />
      </div>

      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(v?: string) => onChange(v ?? "")}
          height={height}
          textareaProps={{ placeholder }}
        />
      </div>
    </div>
  );
}

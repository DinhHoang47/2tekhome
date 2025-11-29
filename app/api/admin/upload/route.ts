import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";
import { isAdminAuth } from "@/lib/auth";

function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication & Authorization check - chỉ admin mới được upload
    const isAdmin = await isAdminAuth(req);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder")?.toString() || "radicals";
    const nameHint = formData.get("nameHint")?.toString() || "radical";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. File validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
        },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // 3. Process upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const filename = `${slugify(nameHint)}-${randomUUID()}.${ext}`;
    const filePath = `${folder}/${filename}`;
    const uploadFile = bucket.file(filePath);

    await uploadFile.save(buffer, {
      contentType: file.type,
      public: true,
      metadata: {
        uploadedBy: "admin", // Có thể lấy từ token nếu cần
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log(`File uploaded by admin to ${filePath}`);

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

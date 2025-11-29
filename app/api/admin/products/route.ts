import { NextResponse } from "next/server";
import { insertProductSchema } from "@/shared/schema";
import { fromError } from "zod-validation-error";
import { storage } from "@/lib/storage";
import { isAdminAuth } from "@/lib/auth"; // giả sử bạn có middleware này

// POST /api/admin/products
export async function POST(request: Request) {
  try {
    // ✅ Kiểm tra quyền admin
    const user = await isAdminAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Đọc body request
    const body = await request.json();

    // ✅ Validate dữ liệu bằng Zod
    const validationResult = insertProductSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: fromError(validationResult.error).toString() },
        { status: 400 }
      );
    }

    // ✅ Lưu dữ liệu vào DB
    const product = await storage.createProduct(validationResult.data);

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}

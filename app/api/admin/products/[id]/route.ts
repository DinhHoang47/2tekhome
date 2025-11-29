import { NextResponse } from "next/server";
import { insertProductSchema } from "@/shared/schema";
import { fromError } from "zod-validation-error";
import { storage } from "@/lib/storage";
import { isAdminAuth } from "@/lib/auth";

// PUT /api/admin/products/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await isAdminAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Cho phép partial update
    const validationResult = insertProductSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: fromError(validationResult.error).toString() },
        { status: 400 }
      );
    }

    const product = await storage.updateProduct(id, validationResult.data);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await isAdminAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await storage.deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}

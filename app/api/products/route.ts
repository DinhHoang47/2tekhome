// app/api/products/route.ts
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage"; // đường dẫn tới storage bạn đã tạo

export async function GET() {
  try {
    console.log("[API] Fetching all products...");
    const products = await storage.getAllProducts();
    console.log(`[API] Found ${products.length} products`);
    if (products.length > 0) {
      console.log(`[API] First product: ${products[0].name}`);
    }
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

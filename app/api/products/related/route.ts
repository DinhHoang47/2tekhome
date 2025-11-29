import { storage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!productId || !category) {
    return NextResponse.json(
      { error: "Missing productId or category parameters" },
      { status: 400 }
    );
  }

  try {
    const relatedProducts = await storage.getRelatedProducts(
      productId,
      category,
      limit
    );

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error("Error in related products API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

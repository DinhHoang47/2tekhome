import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

// GET /api/articles
export async function GET() {
  try {
    const articles = await storage.getPublishedArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertArticleSchema } from "@/shared/schema";
import { fromError } from "zod-validation-error";
import { isAdminAuth } from "@/lib/auth";

// GET /api/admin/articles
export async function GET(request: Request) {
  try {
    const user = await isAdminAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const articles = await storage.getAllArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles
export async function POST(request: Request) {
  try {
    const user = await isAdminAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = insertArticleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: fromError(validationResult.error).toString() },
        { status: 400 }
      );
    }

    const article = await storage.createArticle(validationResult.data);
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { message: "Failed to create article" },
      { status: 500 }
    );
  }
}

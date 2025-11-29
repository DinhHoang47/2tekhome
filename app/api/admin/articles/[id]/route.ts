import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertArticleSchema } from "@/shared/schema";
import { fromError } from "zod-validation-error";
import { isAdminAuth } from "@/lib/auth";

// GET /api/admin/articles/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await isAdminAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: articleId } = await params;

    // Validate article ID
    if (!articleId) {
      return NextResponse.json(
        { message: "Article ID is required" },
        { status: 400 }
      );
    }

    const article = await storage.getArticle(articleId);

    // Check if article exists
    if (!article) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { message: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/:id
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

    const validationResult = insertArticleSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: fromError(validationResult.error).toString() },
        { status: 400 }
      );
    }

    const article = await storage.updateArticle(id, validationResult.data);
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { message: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/:id
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

    await storage.deleteArticle(id);
    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { message: "Failed to delete article" },
      { status: 500 }
    );
  }
}

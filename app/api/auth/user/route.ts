import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { storage } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    // Lấy token từ cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Lấy user từ DB
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Trả về user
    return NextResponse.json({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      // thêm các field khác nếu cần
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

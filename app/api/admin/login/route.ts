import { NextRequest, NextResponse } from "next/server";
import { loginSchema, type LoginCredentials } from "@/shared/schema";
import { storage } from "@/lib/storage";
import { comparePassword, createSessionToken, setAuthCookie } from "@/lib/auth";
import { fromZodError } from "zod-validation-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: fromZodError(validationResult.error).toString() },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data as LoginCredentials;

    const user = await storage.getUserByEmail(email);
    if (!user || !user.password || !user.isAdmin) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Tạo token JWT
    const token = createSessionToken(user);

    // Trả NextResponse với cookie đã set
    const response = NextResponse.json({
      message: "Đăng nhập thành công",
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 1 tuần
    });

    return response;
  } catch (error: any) {
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Lỗi đăng nhập" }, { status: 500 });
  }
}

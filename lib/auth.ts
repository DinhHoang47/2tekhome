import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { storage } from "@/lib/storage";
import { NextRequest } from "next/server";

// Hash mật khẩu khi tạo user
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// So sánh mật khẩu khi đăng nhập
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Tạo JWT token (thay thế session)
export function createSessionToken(user: any) {
  const token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
  return token;
}

// Lưu token vào cookie
export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies(); // 👈 thêm await ở đây
  cookieStore.set("userId", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 1 tuần
  });
}
// Xoá cookie khi logout
export async function clearAuthCookie() {
  const cookieStore = await cookies(); // 👈 cũng thêm await
  cookieStore.delete("userId");
}

export async function isAdminAuth(request?: Request | NextRequest) {
  let token: string | undefined;

  if (request) {
    // Lấy token từ header Authorization hoặc cookie
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      // Lấy token từ cookie
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const cookies = parseCookie(cookieHeader);
        token = cookies.token;
      }
    }
  } else {
    // Fallback: lấy từ cookies() (cho server components)
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user || !user.isAdmin) return false;
    return true;
  } catch {
    return false;
  }
}

// Helper function để parse cookie
function parseCookie(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

// Lấy thông tin user từ token (nếu cần)
export async function getCurrentUser(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = parseCookie(cookieHeader);
  const token = cookies.token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await storage.getUser(decoded.userId);
    return user;
  } catch {
    return null;
  }
}

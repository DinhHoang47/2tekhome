import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { storage } from "@/lib/storage";

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

// Kiểm tra quyền admin (thay cho isAdminAuth middleware)
export async function isAdminAuth(request: Request) {
  const cookieStore = await cookies(); // 👈 thêm await
  const token = cookieStore.get("token")?.value;

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

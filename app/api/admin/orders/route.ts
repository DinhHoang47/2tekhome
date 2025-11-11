import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { isAdminAuth } from "@/lib/auth"; // nếu bạn có middleware kiểm tra admin

export async function GET(request: Request) {
  try {
    // Kiểm tra quyền admin
    const authorized = await isAdminAuth(request);
    if (!authorized) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await storage.getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

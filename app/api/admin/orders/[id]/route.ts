// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const isAdmin = await isAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 2. Validate order ID
    if (!id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { status } = body;

    // 4. Validate status
    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { message: "Status is required and must be a string" },
        { status: 400 }
      );
    }

    // 5. Update order status
    const order = await storage.updateOrderStatus(id, status);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}

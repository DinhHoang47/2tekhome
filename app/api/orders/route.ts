// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { insertOrderSchema } from "@/shared/schema"; // Adjust import path as needed
import { storage } from "@/lib/storage"; // Adjust import path as needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = insertOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: validationResult.error.issues
            .map((error) => `${error.path.join(".")}: ${error.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const order = await storage.createOrder(validationResult.data);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}

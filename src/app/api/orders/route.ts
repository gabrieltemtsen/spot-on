import { NextRequest, NextResponse } from "next/server";
import { createOrder, readOrders } from "@/lib/orders-store";

export async function GET() {
  const orders = readOrders().sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, deliveryType, deliveryAddress, specialInstructions, items } = body;

    if (!customerName || !customerPhone || !deliveryType || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);

    const order = createOrder({
      customerName,
      customerPhone,
      deliveryType,
      deliveryAddress,
      specialInstructions,
      items,
      subtotal,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

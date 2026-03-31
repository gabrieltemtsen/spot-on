import { NextRequest, NextResponse } from "next/server";
import { createOrder, readOrders } from "@/lib/orders-store";
import { notifyNewOrder } from "@/lib/notify";

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

    // Fire-and-forget WhatsApp notification (does not block order creation)
    try {
      const lines = [
        "🛒 New Order (SpotOn)",
        `Order ID: ${order.id}`,
        `Customer: ${order.customerName} (${order.customerPhone})`,
        `Delivery: ${order.deliveryType}${order.deliveryAddress ? ` — ${order.deliveryAddress}` : ""}`,
        `Items: ${order.items
          .map((i) => `${i.quantity}× ${i.name} (₦${Number(i.price).toLocaleString("en-NG")})`)
          .join(", ")}`,
        `Subtotal: ₦${Number(order.subtotal).toLocaleString("en-NG")}`,
        order.specialInstructions ? `Notes: ${order.specialInstructions}` : null,
        `Time: ${new Date(order.createdAt).toLocaleString("en-NG")}`,
        ``,
        `👉 Manage: ${req.nextUrl.origin}/admin`,
      ].filter(Boolean) as string[];

      const msg = lines.join("\n");
      notifyNewOrder(msg).then((r) => {
        if (!r.telegram?.ok) console.warn("Telegram notify:", r.telegram);
        if (!r.whatsapp?.ok) console.warn("WhatsApp notify:", r.whatsapp);
      });
    } catch (e) {
      console.warn("WhatsApp notify error:", e);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

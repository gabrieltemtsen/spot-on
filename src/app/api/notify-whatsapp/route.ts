import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;

  if (!waToken || !waPhoneId || !adminPhone) {
    return NextResponse.json({ sent: false, reason: "WhatsApp not configured" });
  }

  const { orderNumber, customerName, customerPhone, items, subtotal, deliveryType, deliveryAddress } = body;

  const itemsList = items
    .map((i: { emoji: string; name: string; quantity: number; price: number }) =>
      `  ${i.emoji} ${i.name} ×${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`
    )
    .join("\n");

  const message = [
    `🍊 *New Spot-On Order!*`,
    ``,
    `*Order:* ${orderNumber}`,
    `*Customer:* ${customerName}`,
    `*Phone:* ${customerPhone}`,
    `*Type:* ${deliveryType}`,
    deliveryAddress ? `*Address:* ${deliveryAddress}` : null,
    ``,
    `*Items:*`,
    itemsList,
    ``,
    `*Total: ₦${subtotal.toLocaleString()}*`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${waPhoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminPhone,
          type: "text",
          text: { body: message },
        }),
      }
    );
    const data = await res.json();
    return NextResponse.json({ sent: res.ok, data });
  } catch (e) {
    return NextResponse.json({ sent: false, reason: String(e) });
  }
}

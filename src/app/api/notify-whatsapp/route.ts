import { NextRequest, NextResponse } from "next/server";
import { sendTelegram } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Preferred: Telegram (simple admin alerts)
  const telegramConfigured = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

  // Fallback: WhatsApp Cloud API (official)
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;

  const whatsappConfigured = !!(waToken && waPhoneId && adminPhone);

  if (!telegramConfigured && !whatsappConfigured) {
    return NextResponse.json({ sent: false, reason: "No notification channel configured" });
  }

  const {
    orderNumber,
    customerName,
    customerPhone,
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    promoCode,
    total,
    deliveryType,
    deliveryAddress,
    specialInstructions,
  } = body;

  const itemsListPlain = items
    .map((i: { emoji: string; name: string; quantity: number; price: number }) =>
      `${i.emoji} ${i.name} ×${i.quantity} — ₦${(i.price * i.quantity).toLocaleString("en-NG")}`
    )
    .join("\n");

  const resolvedSubtotal = typeof subtotal === "number" ? subtotal : null;
  const resolvedDeliveryFee = typeof deliveryFee === "number" ? deliveryFee : null;
  const resolvedDiscount = typeof discountAmount === "number" ? discountAmount : null;
  const resolvedTotal = typeof total === "number" ? total : resolvedSubtotal;

  const messagePlain = [
    `🍊 New Spot-On Order`,
    `Order: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Type: ${deliveryType}`,
    deliveryAddress ? `Address: ${deliveryAddress}` : null,
    specialInstructions ? `Notes: ${specialInstructions}` : null,
    ``,
    `Items:`,
    itemsListPlain,
    ``,
    resolvedSubtotal !== null ? `Subtotal: ₦${resolvedSubtotal.toLocaleString("en-NG")}` : null,
    resolvedDeliveryFee ? `Delivery fee: ₦${resolvedDeliveryFee.toLocaleString("en-NG")}` : null,
    resolvedDiscount ? `Discount${promoCode ? ` (${promoCode})` : ""}: -₦${resolvedDiscount.toLocaleString("en-NG")}` : null,
    resolvedTotal !== null ? `Total: ₦${resolvedTotal.toLocaleString("en-NG")}` : null,
    ``,
    `👉 Manage: ${req.nextUrl.origin}/admin`,
  ]
    .filter(Boolean)
    .join("\n");

  // 1) Telegram
  if (telegramConfigured) {
    const r = await sendTelegram(messagePlain);
    return NextResponse.json({ sent: r.ok, channel: "telegram", result: r });
  }

  // 2) WhatsApp Cloud API fallback
  const messageWhatsApp = [
    `🍊 *New Spot-On Order!*`,
    ``,
    `*Order:* ${orderNumber}`,
    `*Customer:* ${customerName}`,
    `*Phone:* ${customerPhone}`,
    `*Type:* ${deliveryType}`,
    deliveryAddress ? `*Address:* ${deliveryAddress}` : null,
    specialInstructions ? `*Notes:* ${specialInstructions}` : null,
    ``,
    `*Items:*`,
    items
      .map((i: { emoji: string; name: string; quantity: number; price: number }) =>
        `  ${i.emoji} ${i.name} ×${i.quantity} — ₦${(i.price * i.quantity).toLocaleString("en-NG")}`
      )
      .join("\n"),
    ``,
    resolvedSubtotal !== null ? `*Subtotal: ₦${resolvedSubtotal.toLocaleString("en-NG")}*` : null,
    resolvedDeliveryFee ? `*Delivery fee: ₦${resolvedDeliveryFee.toLocaleString("en-NG")}*` : null,
    resolvedDiscount ? `*Discount${promoCode ? ` (${promoCode})` : ""}: -₦${resolvedDiscount.toLocaleString("en-NG")}*` : null,
    resolvedTotal !== null ? `*Total: ₦${resolvedTotal.toLocaleString("en-NG")}*` : null,
    ``,
    `👉 Manage: ${req.nextUrl.origin}/admin`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: adminPhone,
        type: "text",
        text: { body: messageWhatsApp },
      }),
    });

    const data = await res.json();
    return NextResponse.json({ sent: res.ok, channel: "whatsapp-cloud", data });
  } catch (e) {
    return NextResponse.json({ sent: false, channel: "whatsapp-cloud", reason: String(e) });
  }
}


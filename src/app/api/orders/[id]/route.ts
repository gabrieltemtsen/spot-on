import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus, OrderStatus } from "@/lib/orders-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, adminPassword } = await req.json();

  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "spoton2024";
  if (adminPassword !== ADMIN_PASS) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = updateOrderStatus(id, status);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

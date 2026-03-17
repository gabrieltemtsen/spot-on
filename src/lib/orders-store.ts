import fs from "fs";
import path from "path";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: string;
  specialInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

const DATA_FILE = path.join(process.cwd(), "data", "orders.json");

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

export function readOrders(): Order[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function writeOrders(orders: Order[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export function getOrder(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

export function createOrder(data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "status">): Order {
  const orders = readOrders();
  const id = crypto.randomUUID();
  const orderNumber = `SO-${Date.now().toString().slice(-6)}`;
  const now = Date.now();
  const order: Order = { ...data, id, orderNumber, status: "pending", createdAt: now, updatedAt: now };
  orders.push(order);
  writeOrders(orders);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status, updatedAt: Date.now() };
  writeOrders(orders);
  return orders[idx];
}

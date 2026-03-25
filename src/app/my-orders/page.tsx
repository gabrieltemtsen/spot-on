// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { formatPrice } from "@/lib/menu";
import { Clock, CheckCircle2, ChefHat, PackageCheck, Bike, XCircle, Truck, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";

type StoredOrder = { id: string; orderNumber: string; customerName: string; placedAt: number };

const STATUS_CFG = {
  pending:    { label: "Pending",    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  confirmed:  { label: "Confirmed",  color: "bg-blue-500/20 text-blue-400 border-blue-500/30",       icon: CheckCircle2 },
  preparing:  { label: "Preparing",  color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: ChefHat },
  ready:      { label: "Ready",      color: "bg-green-500/20 text-green-400 border-green-500/30",     icon: PackageCheck },
  dispatched: { label: "Dispatched", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Truck },
  completed:  { label: "Completed",  color: "bg-gray-500/20 text-gray-400 border-gray-500/30",       icon: Bike },
  cancelled:  { label: "Cancelled",  color: "bg-red-500/20 text-red-400 border-red-500/30",          icon: XCircle },
};

function OrderCard({ stored }: { stored: StoredOrder }) {
  const order = useQuery(api.orders.get, { id: stored.id as Id<"orders"> });
  if (order === undefined) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 text-gray-500">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading...
    </div>
  );
  if (order === null) return null;

  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  const total = (order.subtotal ?? 0) + (order.deliveryFee ?? 0);

  return (
    <Link href={`/order/${stored.id}`} className="block bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all hover:bg-white/8 group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-white font-bold font-mono">{order.orderNumber}</p>
          <p className="text-gray-400 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
          <Icon className="w-3 h-3" /> {cfg.label}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {order.items.slice(0, 3).map((item, i) => (
          <p key={i} className="text-gray-300 text-sm">{item.emoji} {item.name} ×{item.quantity}</p>
        ))}
        {order.items.length > 3 && <p className="text-gray-500 text-xs">+{order.items.length - 3} more</p>}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            order.paymentMethod === "transfer" && order.paymentStatus === "awaiting_confirmation"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : order.paymentMethod === "transfer" && order.paymentStatus === "confirmed"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-gray-700 text-gray-400 border-gray-600"
          }`}>
            {order.paymentMethod === "transfer" && order.paymentStatus === "awaiting_confirmation"
              ? "⏳ Payment pending"
              : order.paymentMethod === "transfer" && order.paymentStatus === "confirmed"
              ? "✅ Paid"
              : order.paymentMethod ?? "pending"}
          </span>
        </div>
        <p className="text-green-400 font-bold">{formatPrice(total)}</p>
      </div>
    </Link>
  );
}

export default function MyOrdersPage() {
  const [storedOrders, setStoredOrders] = useState<StoredOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("spoton_orders");
      setStoredOrders(raw ? JSON.parse(raw) : []);
    } catch { setStoredOrders([]); }
    setLoaded(true);
  }, []);

  function clearHistory() {
    localStorage.removeItem("spoton_orders");
    setStoredOrders([]);
  }

  return (
    <main className="bg-[#081C15] min-h-screen">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Orders</h1>
            <p className="text-gray-400 text-sm mt-1">Orders placed on this device</p>
          </div>
          {storedOrders.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Clear history</button>
          )}
        </div>

        {!loaded && (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading...
          </div>
        )}

        {loaded && storedOrders.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">No orders yet</p>
            <p className="text-gray-600 text-sm mt-2">Your orders will appear here after checkout</p>
            <Link href="/menu" className="mt-6 inline-block px-8 py-3 rounded-full bg-green-700 text-white font-semibold hover:bg-green-600 transition-colors">
              Browse Menu 🍊
            </Link>
          </div>
        )}

        {loaded && storedOrders.length > 0 && (
          <div className="space-y-4">
            {storedOrders.map((s) => <OrderCard key={s.id} stored={s} />)}
          </div>
        )}
      </div>
    </main>
  );
}
